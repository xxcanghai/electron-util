import * as _ from "lodash";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as child_process from 'child_process';
import * as networkUtils from './wifi-utils';
var exec = child_process.exec;

var env = _.merge(process.env, <any>{
    LANG: "en_US.UTF-8",
    LC_ALL: "en_US.UTF-8",
    LC_MESSAGES: "en_US.UTF-8"
});

const noop = function () { };

export var config = {
    debug: false,
    iface: null
};

export function scan(callback: (err: Error | null, networks?: NetworkItem[]) => void = noop): Promise<NetworkItem[]> {
    function parse(networkTmp): NetworkItem {
        var network = <NetworkItem>{};

        network.mac = networkTmp[4].match(/.*?:\s(.*)/)[1];
        network.bssid = network.mac;
        network.ssid = networkTmp[0].match(/.*?:\s(.*)/)[1];
        network.channel = parseInt(networkTmp[7].match(/.*?:\s(.*)/)[1]);
        network.frequency = parseInt(networkUtils.frequencyFromChannel(network.channel));
        network.signal_level = networkUtils.dBFromQuality(networkTmp[5].match(/.*?:\s(.*)/)[1]);
        network.quality = parseFloat(networkTmp[5].match(/.*?:\s(.*)/)[1]);
        network.security = networkTmp[2].match(/.*?:\s(.*)/)[1];
        network.security_flags = networkTmp[3].match(/.*?:\s(.*)/)[1];
        network.mode = 'Unknown';

        return network;
    }

    return new Promise<NetworkItem[]>(function (res, rej) {
        try {
            exec("chcp 65001 && netsh wlan show networks mode=Bssid", env, function (err, execResults) {
                if (err) {
                    callback(err);
                    rej(err);
                    return;
                }

                var scanResults: string[] = execResults.toString('utf8').split('\r').join('').split('\n').slice(5, execResults.length);

                var numNetworks = -1;
                var currentLine = 0;
                var networkTmp: string[];
                var networksTmp: string[][] = [];
                var network: NetworkItem;
                var networks: NetworkItem[] = [];
                var i;

                for (i = 0; i < scanResults.length; i++) {
                    if (scanResults[i] === '') {
                        numNetworks++;
                        networkTmp = scanResults.slice(currentLine, i);
                        networksTmp.push(networkTmp);
                        currentLine = i + 1;
                    }
                }

                for (i = 0; i < numNetworks; i++) {
                    network = parse(networksTmp[i]);
                    networks.push(network);
                }
                networks = networks.sort((a, b) => {
                    return b.signal_level - a.signal_level;
                }) 

                callback(null, networks);
                res(networks)
            });
        } catch (e) {
            callback(e);
            rej(e);
            return;
        }
    });
}

export function connect(ap: ConnectApOption, callback: (err: Error | null) => void = noop) {
    var xmlPath: string = path.join(os.tmpdir(), ap.ssid + ".xml");
    scan()
        .then(function (networks) {
            var selectedAp = networks.find(function (network) {
                return network.ssid === ap.ssid;
            });

            if (selectedAp === undefined) {
                throw "SSID not found";
            }

            fs.writeFileSync(xmlPath, win32WirelessProfileBuilder(selectedAp, ap.password));
        })
        .then(function () {
            return execCommand(`netsh wlan add profile filename=\"${xmlPath}\"`)
        })
        .then(function () {
            var cmd = `netsh wlan connect ssid=\"${ap.ssid}\" name=\"${ap.ssid}\"`
            if (config.iface) {
                cmd += ` interface=\"${config.iface}\"`
            }
            return execCommand(cmd);
        })
        .then(function () {
            return execCommand(`del \"${xmlPath}\"`);
        })
        .then(function () {
            callback && callback(null);
        })
        .catch(function (err) {
            exec(`netsh wlan delete profile \"${ap.ssid}\"`, env, function () {
                callback && callback(err);
            });
        });



    function execCommand(cmd) {
        return new Promise(function (resolve, reject) {
            exec(cmd, env, function (err: any, stdout, stderr) {
                if (err) {
                    // Add command output to error, so it's easier to handle
                    err.stdout = stdout;
                    err.stderr = stderr;

                    reject(err);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    function getHexSsid(plainTextSsid) {
        var i, j, ref, hex;

        hex = "";

        for (i = j = 0, ref = plainTextSsid.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
            hex += plainTextSsid.charCodeAt(i).toString(16);
        }

        return hex;
    }

    function win32WirelessProfileBuilder(selectedAp, key) {
        var profile_content = "<?xml version=\"1.0\"?> <WLANProfile xmlns=\"http://www.microsoft.com/networking/WLAN/profile/v1\"> <name>" + selectedAp.ssid + "</name> <SSIDConfig> <SSID> <hex>" + getHexSsid(selectedAp.ssid) + "</hex> <name>" + selectedAp.ssid + "</name> </SSID> </SSIDConfig>";

        if (selectedAp.security.indexOf("WPA2") !== -1) {
            profile_content += "<connectionType>ESS</connectionType> <connectionMode>auto</connectionMode> <autoSwitch>true</autoSwitch> <MSM> <security> <authEncryption> <authentication>WPA2PSK</authentication> <encryption>AES</encryption> <useOneX>false</useOneX> </authEncryption> <sharedKey> <keyType>passPhrase</keyType> <protected>false</protected> <keyMaterial>" + key + "</keyMaterial> </sharedKey> </security> </MSM>";
        } else if (selectedAp.security.indexOf("WPA") !== -1) {
            profile_content += "<connectionType>ESS</connectionType> <connectionMode>auto</connectionMode> <autoSwitch>true</autoSwitch> <MSM> <security> <authEncryption> <authentication>WPAPSK</authentication> <encryption>TKIP</encryption> <useOneX>false</useOneX> </authEncryption> <sharedKey> <keyType>passPhrase</keyType> <protected>false</protected> <keyMaterial>" + key + "</keyMaterial> </sharedKey> </security> </MSM>";
        } else {
            if (selectedAp.security_flags.indexOf("WEP") !== -1) {
                profile_content += "<connectionType>ESS</connectionType> <connectionMode>auto</connectionMode> <autoSwitch>true</autoSwitch> <MSM> <security> <authEncryption> <authentication>open</authentication> <encryption>WEP</encryption> <useOneX>false</useOneX> </authEncryption> <sharedKey> <keyType>networkKey</keyType> <protected>false</protected> <keyMaterial>" + key + "</keyMaterial> </sharedKey> </security> </MSM>";
            } else {
                profile_content += "<connectionType>ESS</connectionType> <connectionMode>manual</connectionMode> <MSM> <security> <authEncryption> <authentication>open</authentication> <encryption>none</encryption> <useOneX>false</useOneX> </authEncryption> </security> </MSM>";
            }
        }

        profile_content += "</WLANProfile>";
        return profile_content;
    }
}

interface ConnectApOption {
    ssid: string;
    password: string;
}

export function getCurrentConnection(callback: (err: Error | null, networks?: NetworkItem[]) => void = noop) {
    var commandStr = "chcp 65001 && netsh wlan show interfaces";
    exec(commandStr, env, function (err, stdout) {
        if (err) {
            callback && callback(err);
        } else {
            try {
                var connections = parseShowInterfaces(stdout)
                callback && callback(null, connections);
            } catch (e) {
                callback && callback(e);
            }
        }
    });

    function parseShowInterfaces(stdout): NetworkItem[] {
        var lines = stdout.split('\r\n');
        var connections: NetworkItem[] = [];
        var i = 4;
        while (lines.length > i + 18) {
            var connection = {
                iface: null,          // Name
                ssid: null,           // SSID
                bssid: null,
                mode: '',
                mac: null,            // Physical address
                frequency: 0,         // NetworkUtils.frequencyFromChannel(Channel)
                signal_level: 0,      // Signal, but is in percent not dBm
                security: null,        // Authentication
                security_flags: null,
            };

            var tmpConnection = {};
            var fields = [
                'name',
                'description',
                'guid',
                'mac',
                'state',
                'ssid',
                'bssid',
                'mode',
                'radio',
                'authentication',
                'encryption',
                'connection',
                'channel',
                'reception',
                'transmission',
                'signal',
                'profil'
            ];
            for (var j = 0; j < fields.length; j++) {
                var line = lines[i + j];
                tmpConnection[fields[j]] = line.match(/.*\: (.*)/)[1];
            }

            connections.push({
                iface: tmpConnection['name'],
                ssid: tmpConnection['ssid'],
                bssid: tmpConnection['bssid'],
                mac: tmpConnection['bssid'],
                mode: tmpConnection['mode'],
                channel: parseInt(tmpConnection['channel']),
                frequency: parseInt(networkUtils.frequencyFromChannel(parseInt(tmpConnection['channel']))),
                signal_level: networkUtils.dBFromQuality(tmpConnection['signal']),
                quality: parseFloat(tmpConnection['signal']),
                security: tmpConnection['authentication'],
                security_flags: tmpConnection['encryption'],
            })

            i = i + 18;
        }

        return connections;
    }

}

export function disconnect(callback: (err: Error | null) => void = noop) {
    var cmd = "netsh wlan disconnect"
    if (config.iface) {
        cmd += ' interface="' + config.iface + '"'
    }
    exec(cmd, env, function (err, resp) {
        callback && callback(err);
    });
}

export interface NetworkItem {
    iface?: string;
    ssid: string;
    bssid: string;
    mac: string;// equals to bssid (for retrocompatibility)
    channel: number;
    frequency: number;// in MHz
    signal_level: number; // in dB
    quality: number; // same as signal level but in %
    security: string; //'WPA WPA2' // format depending on locale for open networks in Windows
    security_flags: string; // encryption protocols (format currently depending of the OS)
    mode: "Unknown"; // network mode like Infra (format currently depending of the OS)
}