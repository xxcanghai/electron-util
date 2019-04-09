import * as usb from 'usb';

var UVC_SET_CUR = 0x01;
var UVC_GET_CUR = 0x81;
var UVC_GET_MIN = 0x82;
var UVC_GET_MAX = 0x83;
var UVC_INPUT_TERMINAL_ID = 0x01;
var UVC_PROCESSING_UNIT_ID = 0x03;
var NOOP = function () { };

// See USB Device Class Definition for Video Devices Revision 1.1
// http://www.usb.org/developers/docs/devclass_docs/
// Specifically:
// - 4.2 VideoControl Requests
// - A.9. Control Selector Codes

var Controls = {
  // ==============
  // Input Terminal
  // ==============
  autoExposureMode: { // TODO - needs constants
    // D0: Manual Mode – manual Exposure Time, manual Iris
    // D1: Auto Mode – auto Exposure Time, auto Iris
    // D2: Shutter Priority Mode – manual Exposure Time, auto Iris
    // D3: Aperture Priority Mode – auto Exposure Time, manual Iris
    // D4..D7: Reserved, set to zero.
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x02,
    size: 1
  },
  autoExposurePriority: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x03,
    size: 1
  },
  absoluteExposureTime: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x04,
    size: 4
  },
  absoluteFocus: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x06,
    size: 2
  },
  absoluteZoom: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x0B,
    size: 2
  },
  absolutePanTilt: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x0D,
    size: 8 // dwPanAbsolute (4 bytes) + dwTiltAbsolute (4 bytes)
  },
  autoFocus: {
    unit: UVC_INPUT_TERMINAL_ID,
    selector: 0x08,
    size: 1
  },
  // ===============
  // Processing Unit
  // ===============
  brightness: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x02,
    size: 2
  },
  contrast: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x03,
    size: 2
  },
  saturation: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x07,
    size: 2
  },
  sharpness: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x08,
    size: 2
  },
  whiteBalanceTemperature: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x0A,
    size: 2
  },
  backlightCompensation: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x01,
    size: 2
  },
  gain: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x04,
    size: 2
  },
  autoWhiteBalance: {
    unit: UVC_PROCESSING_UNIT_ID,
    selector: 0x0B,
    size: 1
  }
};

type ControlName = keyof typeof Controls;

export default class UVCControl {
  vid: number;
  pid: number;
  options: UVCControlOptions;
  device: usb.Device;
  interfaceNumber!: number;

  constructor(vid: number, pid: number, options: UVCControlOptions = {}) {
    this.vid = vid;
    this.pid = pid;
    this.options = options || {};

    // 初始化
    this.device = usb.findByIds(this.vid, this.pid);
    if (this.device) {
      this.device.open();
      var num = this.detectVideoControlInterface(this.device);
      if (num == -1) {
        throw new Error("没有找到VideoControl的接口")
      } else {
        this.interfaceNumber = num;
      }
    }
  }

  public getUnitOverride(unit: number): number {
    if (unit == UVC_INPUT_TERMINAL_ID && this.options.inputTerminalId) {
      return this.options.inputTerminalId;
    }
    if (unit == UVC_PROCESSING_UNIT_ID && this.options.processingUnitId) {
      return this.options.processingUnitId
    }
    return unit;
  }

  public getControlParams(id: ControlName, callback: (err: Error | null, params?: ControlParam) => void = NOOP) {
    if (!this.device) {
      return callback(new Error('USB device not found with vid 0x' + this.vid.toString(16) + ', pid 0x' + this.pid.toString(16)));
    }
    if (this.interfaceNumber === undefined) {
      return callback(new Error('UVC compliant device not found.'));
    }
    var control = Controls[id];
    if (!control) {
      return callback(new Error('UVC Control identifier not recognized: ' + id));
    }

    var unit = this.getUnitOverride(control.unit);
    var params: ControlParam = {
      wValue: (control.selector << 8) | 0x00,
      wIndex: (unit << 8) | this.interfaceNumber,
      wLength: control.size
    };
    callback(null, params);
  };

  /**
   * Close the device
   */
  public close() {
    this.device.close();
  }

  /**
   * Get the value of a control
   * @param  {string} controlName
   * @param  {Function} callback(error,value)
   */
  public get(id: ControlName, callback: (err: Error | null, data?: number) => void = NOOP) {
    type that = this;
    this.getControlParams(id, function (this: that, error, params) {
      if (error) return callback(error);
      this.device.controlTransfer(0b10100001, UVC_GET_CUR, params.wValue, params.wIndex, params.wLength, function (error, buffer) {
        if (error) return callback(error);
        if (buffer == undefined) {
          throw new Error("")
        }
        callback(null, buffer.readIntLE(0, params.wLength));
      });
    }.bind(this));
  }

  /**
   * Set the value of a control
   * @param  {string}   controlId
   * @param  {number}   value
   * @param  {Function} callback(error)
   */
  public set(id: ControlName, value: number, callback: (error?: usb.LibUSBException, buf?: Buffer) => void = NOOP) {
    type that = this;
    this.getControlParams(id, function (this: that, error, params) {
      if (error) return callback(error);
      var data = new Buffer(params.wLength);
      data.writeIntLE(value, 0, params.wLength);
      this.device.controlTransfer(0b00100001, UVC_SET_CUR, params.wValue, params.wIndex, data, callback);
    }.bind(this));
  }

  /**
   * Set the raw value of a control
   * @param  {string}   controlId
   * @param  {buffer}   value
   * @param  {Function} callback(error)
   */
  public setRaw(id: ControlName, value: any, callback: (error?: usb.LibUSBException, buf?: Buffer) => void = NOOP) {
    type that = this;
    this.getControlParams(id, function (this: that, error, params) {
      if (error) return callback(error);
      this.device.controlTransfer(0b00100001, UVC_SET_CUR, params.wValue, params.wIndex, value, callback);
    }.bind(this));
  }

  /**
   * Get the min and max range of a control
   * @param  {string} controlName
   * @param  {Function} callback(error,minMax)
   */
  public range(id: ControlName, callback: (error: Error | null, min_max?: [number, number]) => void = NOOP) {
    type that = this;
    this.getControlParams(id, function (this: that, error, params) {
      if (error) return callback(error);
      this.device.controlTransfer(0b10100001, UVC_GET_MIN, params.wValue, params.wIndex, params.wLength, function (this: that, error, min) {
        if (error) return callback(error);
        this.device.controlTransfer(0b10100001, UVC_GET_MAX, params.wValue, params.wIndex, params.wLength, function (this: that, error, max) {
          if (error) return callback(error);
          callback(null, [min.readIntLE(0, params.wLength), max.readIntLE(0, params.wLength)]);
        }.bind(this));
      }.bind(this));
    }.bind(this));
  }



  /**
   * Given a USB device, iterate through all of the exposed interfaces looking for
   * the one for VideoControl. bInterfaceClass = CC_VIDEO (0x0e) and
   * bInterfaceSubClass = SC_VIDEOCONTROL (0x01)
   * @param  {object} device
   * @return {object} interface
   */
  private detectVideoControlInterface(device: usb.Device) {
    var interfaces = device.interfaces;
    for (var i = 0; i < interfaces.length; i++) {
      if (interfaces[i].descriptor.bInterfaceClass == 0x0e &&
        interfaces[i].descriptor.bInterfaceSubClass == 0x01
      ) {
        return i;
      }
    }
    return -1;
  }


  /**
   * Get list of recognized controls
   * @return {Array} controls
   */
  static controls = Object.keys(Controls);

  static showDeviceList() {
    var devices = usb.getDeviceList();
    devices.forEach(function (device) {
      var vendorId = device.deviceDescriptor.idVendor;
      var productId = device.deviceDescriptor.idProduct;
      if (device.deviceDescriptor.iProduct) {
        device.open();
        var name = device.getStringDescriptor(device.deviceDescriptor.iProduct, function (error, product) {
          console.log(product, '[ vId: 0x' + vendorId.toString(16), ' / pId: 0x' + productId.toString(16), ' ]');
          device.close();
        });
      }
    });
  }
}


interface UVCControlOptions {
  inputTerminalId?: number;
  processingUnitId?: number;
}

interface ControlParam {
  wValue: number;
  wIndex: number;
  wLength: number;
}