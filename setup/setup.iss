; Inno Setup 脚本
; 说明：此文件是脚本模板，会经过gulpfile.js渲染，最终执行的脚本文件见./dist/setup.iss     
; 此模板中包含三类模板代码：
; 1、{xxx}，{xxx:xxx} 单花括号。为ISS脚本内置变量或函数，如：{app},{cmd}
; 2、{#xxx} 单花括号带#号。为ISS脚本内预定义（#define）的变量，如：{#MyAppChName}
; 3、{{xxx}} 双花括号。为由build/build-setup.js进行渲染的外部变量，均定义在build/build-setup.js文件内的app变量中。如：{{MyAppPath}}
;
; ——jicanghai
; 2018-11-22


#define MyAppPath "{{MyAppPath}}"
#define MyAppName "{{MyAppName}}"
#define MyAppChName "{{MyAppChName}}" 
#define MyAppProductName "{{MyAppProductName}}"  
; #define MyAppNodeEnv "{{MyAppNodeEnv}}"
#define MyAppVersion "{{MyAppVersion}}"
#define MyAppPublisher "{{MyAppPublisher}}"
#define MyAppURL "https://www.suimeeting.com/"
#define MyAppExeName "{{MyAppName}}.exe" 
#define MyAppPlatform "{{MyAppPlatform}}"
#define MyAppArch "{{MyAppArch}}"#define MyAppEnv "{{MyAppEnv}}"
#define MyAppBuildDate "{{MyAppBuildDate}}"
#define MyOutputFilename "{{MyOutputFilename}}"
#define MyAppicon "{{MyAppicon}}"

[Setup]
; 注: AppId的值为单独标识该应用程序。
; 不要为其他安装程序使用相同的AppId值。
; (生成新的GUID，点击 工具|在IDE中生成GUID。)
AppId={{97622C90-5A2C-49D8-9F79-138CAB5B4590}
AppName={#MyAppChName}
AppVersion={#MyAppVersion}AppVerName={#MyAppChName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={userappdata}\{#MyAppName}
OutputDir={#MyAppPath}\build
OutputBaseFilename={#MyOutputFilename}
Compression=lzma
SolidCompression=yes
DefaultGroupName={#MyAppChName} 
DirExistsWarning=no
VersionInfoDescription={#MyAppChName}{#MyAppVersion}   
;-----控制是否显示指定安装页-----
;是否不显示“选择安装位置”页
DisableDirPage=auto
;是否不显示“安装完成”页
DisableFinishedPage=no
;是否不显示“选择开始菜单”页 
DisableProgramGroupPage=yes
;是否不在“准备安装“向导页的设置列表
DisableReadyMemo=yes
;是否不显示“准备安装”向导页
DisableReadyPage=yes
;是否不显示“欢迎”向导页
DisableWelcomePage=no
;设定安装程序和卸载程序图标
SetupIconFile={#MyAppicon}
;签名工具
;SignTool=mysign sign /a /n $qMy Common Name$q /t http://timestamp.comodoca.com/authenticode /d $qMy Program$q $fSignTool=mysign sign /f $q{{MyPfxPath}}$q /p {{MyPfxPwd}} /fd sha256 /tr http://sha256timestamp.ws.symantec.com/sha256/timestamp /v $f
SignToolRetryCount=5

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
;Tasks为用户可选操作，移除tasks即为：不允许用户选择是否创建桌面快捷方式
;Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
;询问用户是否增加开机启动
;Name: "startupicon"; Description: "开机启动"; GroupDescription: "{cm:AdditionalIcons}";
    
[Dirs]
; 设定应用程序权限。
; 此处若不加Permissions: users-modify，程序将无法修改程序自身目录文件。
; 但加上此选项将导致安装包exe运行时需要向系统申请用户帐户控制权限（UAC）
; 若安装包exe没有经过证书签名则会弹出安全警告（仅Vista及以上版本系统）
Name: "{app}";

[Files]
; 设定启动exe文件为sign标记，将使用的是[Setup]段的SignTool参数，为其进行证书签名操作。
Source: "{#MyAppPath}\build\{#MyAppName}-{#MyAppPlatform}-{#MyAppArch}\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion sign
Source: "{#MyAppPath}\build\{#MyAppName}-{#MyAppPlatform}-{#MyAppArch}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; 注意: 不要在任何共享系统文件上使用“Flags: ignoreversion”

[Code]

// 安装时判断客户端是否正在运行  
function InitializeSetup(): Boolean;
//进程ID
var appWnd: HWND;
begin  
  Result :=true; //安装程序继续  
  appWnd :=FindWindowByWindowName('随会'); // 进程ID
  if appWnd<>0 then
  begin  
    if Msgbox('安装程序检测到随会正在运行!'#13''#13'点击 "是" 将停止软件然后继续安装; 点击 "否" 将终止安装程序', mbConfirmation, MB_YESNO) = idNO then  
    begin  
      Result :=false; //安装程序退出
    end else begin
      PostMessage(appWnd, 18, 0, 0); // 结束客户端进程  
      Result :=true; //安装程序继续
    end;  
  end;  
end;  
  
// 卸载时判断客户端是否正在运行  
function InitializeUninstall(): Boolean;
var appWnd: HWND;  
begin  
  Result :=true; //安装程序继续    
  appWnd :=FindWindowByWindowName('随会');  
  if appWnd<>0 then  
  begin  
    if Msgbox('安装程序检测到随会正在运行!'#13''#13'点击 "是" 将停止软件然后继续卸载; 点击 "否" 将终止卸载程序', mbConfirmation, MB_YESNO) = idNO then  
    begin  
      Result :=false; //安装程序退出
    end else begin
      PostMessage(appWnd, 18, 0, 0); // 结束客户端进程  
      Result :=true; //安装程序继续 
    end;  
  end;  
end;  

//在注册表中插入DisplayIcon项，指定安装卸载页面的程序图标；
function SetUninstallIcon(iconPath:string): Boolean;
var
  InstalledVersion,SubKeyName: String;
begin
if IsWin64 then begin
//自己的appID 

SubKeyName :=  'Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall\{97622C90-5A2C-49D8-9F79-138CAB5B4590}_is1';
    RegWriteStringValue(HKLM64,SubKeyName,'DisplayIcon',iconPath);
  end else begin
SubKeyName :=  'Software\Microsoft\Windows\CurrentVersion\Uninstall\{97622C90-5A2C-49D8-9F79-138CAB5B4590}_is1';
    RegWriteStringValue(HKLM,SubKeyName,'DisplayIcon',iconPath);
  end;
end;

procedure CurPageChanged(CurPageID: Integer);
begin
  if CurPageID = wpFinished then
  begin
    SetUninstallIcon(ExpandConstant('{app}\icon.ico'));
  end;
end;


[Icons]
;创建开始菜单的主程序exe
Name: "{group}\{#MyAppChName}"; Filename: "{app}\{#MyAppExeName}"
;创建开始菜单的卸载exe
Name: "{group}\{cm:UninstallProgram,{#MyAppChName}}"; Filename: "{uninstallexe}"
;创建桌面的主程序exe的快捷方式
Name: "{commondesktop}\{#MyAppChName}"; Filename: "{app}\{#MyAppExeName}";

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppChName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; 卸载前执行CMD命令，删除程序目录文件夹所有文件
Filename: "{cmd}"; Parameters: "/c rd /s /q ""{app}"""; Flags: hidewizard runhidden
; 删除内部储存目录所有文件（cookie，localstorage等）Filename: "{cmd}"; Parameters: "/c rd /s /q ""{localappdata}\{#MyAppProductName}"""; Flags: hidewizard runhidden


; 目录常量：
; 【vista及以上】
; {app} C:\Program Files\suimeetinge
; {localappdata} C:\Users\【用户名】\AppData\Local
; {userappdata} C:\Users\【用户名】\AppData\Roaming; {commonappdata} C:\ProgramData
; 【XP】           
; {app} C:\Program Files\suimeetinge
; {localappdata} C:\Documents and Settings\admin\Local Settings\Application Data
; {userappdata} C:\Documents and Settings\admin\Application Data
; {commonappdata} C:\Documents and Settings\All Users\Application Data


; 壳子chrome内部数据存储目录
; 【vista及以上】 C:\Users\【用户名】\AppData\Local\suimeeting_electron
; 【XP】C:\Documents and Settings\admin\Local Settings\Application Data\suimeeting_electron

[UninstallDelete]
Name: {app}; Type: filesandordirs
