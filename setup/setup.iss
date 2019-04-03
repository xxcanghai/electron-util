; Inno Setup �ű�
; ˵�������ļ��ǽű�ģ�壬�ᾭ��gulpfile.js��Ⱦ������ִ�еĽű��ļ���./dist/setup.iss     
; ��ģ���а�������ģ����룺
; 1��{xxx}��{xxx:xxx} �������š�ΪISS�ű����ñ����������磺{app},{cmd}
; 2��{#xxx} �������Ŵ�#�š�ΪISS�ű���Ԥ���壨#define���ı������磺{#MyAppChName}
; 3��{{xxx}} ˫�����š�Ϊ��build/build-setup.js������Ⱦ���ⲿ��������������build/build-setup.js�ļ��ڵ�app�����С��磺{{MyAppPath}}
;
; ����jicanghai
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
; ע: AppId��ֵΪ������ʶ��Ӧ�ó���
; ��ҪΪ������װ����ʹ����ͬ��AppIdֵ��
; (�����µ�GUID����� ����|��IDE������GUID��)
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
;-----�����Ƿ���ʾָ����װҳ-----
;�Ƿ���ʾ��ѡ��װλ�á�ҳ
DisableDirPage=auto
;�Ƿ���ʾ����װ��ɡ�ҳ
DisableFinishedPage=no
;�Ƿ���ʾ��ѡ��ʼ�˵���ҳ 
DisableProgramGroupPage=yes
;�Ƿ��ڡ�׼����װ����ҳ�������б�
DisableReadyMemo=yes
;�Ƿ���ʾ��׼����װ����ҳ
DisableReadyPage=yes
;�Ƿ���ʾ����ӭ����ҳ
DisableWelcomePage=no
;�趨��װ�����ж�س���ͼ��
SetupIconFile={#MyAppicon}
;ǩ������
;SignTool=mysign sign /a /n $qMy Common Name$q /t http://timestamp.comodoca.com/authenticode /d $qMy Program$q $fSignTool=mysign sign /f $q{{MyPfxPath}}$q /p {{MyPfxPwd}} /fd sha256 /tr http://sha256timestamp.ws.symantec.com/sha256/timestamp /v $f
SignToolRetryCount=5

[Languages]
Name: "chinesesimp"; MessagesFile: "compiler:Default.isl"

[Tasks]
;TasksΪ�û���ѡ�������Ƴ�tasks��Ϊ���������û�ѡ���Ƿ񴴽������ݷ�ʽ
;Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"
;ѯ���û��Ƿ����ӿ�������
;Name: "startupicon"; Description: "��������"; GroupDescription: "{cm:AdditionalIcons}";
    
[Dirs]
; �趨Ӧ�ó���Ȩ�ޡ�
; �˴�������Permissions: users-modify�������޷��޸ĳ�������Ŀ¼�ļ���
; �����ϴ�ѡ����°�װ��exe����ʱ��Ҫ��ϵͳ�����û��ʻ�����Ȩ�ޣ�UAC��
; ����װ��exeû�о���֤��ǩ����ᵯ����ȫ���棨��Vista�����ϰ汾ϵͳ��
Name: "{app}";

[Files]
; �趨����exe�ļ�Ϊsign��ǣ���ʹ�õ���[Setup]�ε�SignTool������Ϊ�����֤��ǩ��������
Source: "{#MyAppPath}\build\{#MyAppName}-{#MyAppPlatform}-{#MyAppArch}\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion sign
Source: "{#MyAppPath}\build\{#MyAppName}-{#MyAppPlatform}-{#MyAppArch}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; ע��: ��Ҫ���κι���ϵͳ�ļ���ʹ�á�Flags: ignoreversion��

[Code]

// ��װʱ�жϿͻ����Ƿ���������  
function InitializeSetup(): Boolean;
//����ID
var appWnd: HWND;
begin  
  Result :=true; //��װ�������  
  appWnd :=FindWindowByWindowName('���'); // ����ID
  if appWnd<>0 then
  begin  
    if Msgbox('��װ�����⵽�����������!'#13''#13'��� "��" ��ֹͣ���Ȼ�������װ; ��� "��" ����ֹ��װ����', mbConfirmation, MB_YESNO) = idNO then  
    begin  
      Result :=false; //��װ�����˳�
    end else begin
      PostMessage(appWnd, 18, 0, 0); // �����ͻ��˽���  
      Result :=true; //��װ�������
    end;  
  end;  
end;  
  
// ж��ʱ�жϿͻ����Ƿ���������  
function InitializeUninstall(): Boolean;
var appWnd: HWND;  
begin  
  Result :=true; //��װ�������    
  appWnd :=FindWindowByWindowName('���');  
  if appWnd<>0 then  
  begin  
    if Msgbox('��װ�����⵽�����������!'#13''#13'��� "��" ��ֹͣ���Ȼ�����ж��; ��� "��" ����ֹж�س���', mbConfirmation, MB_YESNO) = idNO then  
    begin  
      Result :=false; //��װ�����˳�
    end else begin
      PostMessage(appWnd, 18, 0, 0); // �����ͻ��˽���  
      Result :=true; //��װ������� 
    end;  
  end;  
end;  

//��ע����в���DisplayIcon�ָ����װж��ҳ��ĳ���ͼ�ꣻ
function SetUninstallIcon(iconPath:string): Boolean;
var
  InstalledVersion,SubKeyName: String;
begin
if IsWin64 then begin
//�Լ���appID 

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
;������ʼ�˵���������exe
Name: "{group}\{#MyAppChName}"; Filename: "{app}\{#MyAppExeName}"
;������ʼ�˵���ж��exe
Name: "{group}\{cm:UninstallProgram,{#MyAppChName}}"; Filename: "{uninstallexe}"
;���������������exe�Ŀ�ݷ�ʽ
Name: "{commondesktop}\{#MyAppChName}"; Filename: "{app}\{#MyAppExeName}";

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppChName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallRun]
; ж��ǰִ��CMD���ɾ������Ŀ¼�ļ��������ļ�
Filename: "{cmd}"; Parameters: "/c rd /s /q ""{app}"""; Flags: hidewizard runhidden
; ɾ���ڲ�����Ŀ¼�����ļ���cookie��localstorage�ȣ�Filename: "{cmd}"; Parameters: "/c rd /s /q ""{localappdata}\{#MyAppProductName}"""; Flags: hidewizard runhidden


; Ŀ¼������
; ��vista�����ϡ�
; {app} C:\Program Files\suimeetinge
; {localappdata} C:\Users\���û�����\AppData\Local
; {userappdata} C:\Users\���û�����\AppData\Roaming; {commonappdata} C:\ProgramData
; ��XP��           
; {app} C:\Program Files\suimeetinge
; {localappdata} C:\Documents and Settings\admin\Local Settings\Application Data
; {userappdata} C:\Documents and Settings\admin\Application Data
; {commonappdata} C:\Documents and Settings\All Users\Application Data


; ����chrome�ڲ����ݴ洢Ŀ¼
; ��vista�����ϡ� C:\Users\���û�����\AppData\Local\suimeeting_electron
; ��XP��C:\Documents and Settings\admin\Local Settings\Application Data\suimeeting_electron

[UninstallDelete]
Name: {app}; Type: filesandordirs
