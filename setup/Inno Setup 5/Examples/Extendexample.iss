; -- ExtendExample.iss --
;
;������չ�Ľű�����ʾ��

[Setup]
AppName=My Program
AppVerName=My Program version 1.5
DefaultDirName={pf}\My Program
DefaultGroupName=My Program
UninstallDisplayIcon={app}\MyProg.exe
OutputDir=userdocs:Inno Setup Examples Output

[Types]
Name: full; Description: Full installation
Name: compact; Description: Compact installation
Name: custom; Description: Custom installation; Flags: iscustom

[Components]
Name: program; Description: Program Files; Types: full compact custom; Flags: fixed
Name: help; Description: Help File; Types: full
Name: readme; Description: Readme File; Types: full
Name: readme\en; Description: English; Flags: exclusive
Name: readme\de; Description: German; Flags: exclusive

[Files]
Source: compiler:MyProg.exe; DestDir: {app}; Components: program
Source: compiler:MyProg.chm; DestDir: {app}; Components: help
Source: compiler:Readme.txt; DestDir: {app}; Components: readme\en; Flags: isreadme
Source: compiler:Readme-German.txt; DestName: Liesmich.txt; DestDir: {app}; Components: readme\de; Flags: isreadme

[Icons]
Name: {group}\My Program; Filename: {app}\MyProg.exe

[Code]
function ClientToScreen(hWnd: HWND; var lpPoint: TPoint): Boolean;
external 'ClientToScreen@user32.dll stdcall';

Const
  ReCount = 5;
  MenuCount = 6;

var
  RemarkList:array[0..ReCount - 1] of string;
  WebButton: TButton;
  PM: TPopupMenu;
  MenuCaptions: Array[0..MenuCount - 1] of String;
  MenuTexts: Array[0..MenuCount - 1] of String;

  Info: TNewStaticText;
  InfoCaption: TNewStaticText;
  InfoPanel: TPanel;

  TranPanel: TNewTranPanel; //͸��Panel
  ChkBox:TCheckBox;
  Lb1: TLabel;

// �����ǵ������ҳ����ť�����Ӧ����
procedure WebButtonOnClick(Sender: TObject);
var
  P:TPoint;
begin
  P.X := -1;
  P.Y := -1;
  ClientToScreen(WebButton.Handle, P);
  PM.Popup(P.X + 2, P.Y + 2);
end;

//�����ǵ�����˵�������¼�����
procedure PopupMenuOnClick(Sender: TObject);
var
  ErrorCode: Integer;
begin
  ShellExec('', MenuTexts[TMenuItem(Sender).Tag], '', '', SW_SHOW, ewNoWait, ErrorCode);
end;

procedure OnComponentsListMouseMove(Sender:Tobject;Shift: TShiftState;   X, Y: Integer);
var
  Index: Integer;
begin
   Index := WizardForm.ComponentsList.ItemAtPos(Point(X, Y), True);
   if index = - 1 then Exit;
   Info.Caption := RemarkList[index];
end;

procedure OnChkBoxClick(Sender: Tobject);
Begin
  TranPanel.Transparent := ChkBox.Checked;
End;

procedure OnWizardBitmapImageClick(Sender: Tobject);
Begin
  MsgBox('WizardBitmapImage ֧�ֵ����¼���ʾ', mbInformation, MB_OK);
End;

procedure InitializeWizard();
Var
  Item,SubItem: TMenuItem;
  C, J: Integer;
begin

  //���������ڡ���ť
  WebButton := TButton.Create(WizardForm);
  WebButton.Left := WizardForm.ClientWidth - WizardForm.CancelButton.Left - WizardForm.CancelButton.Width;
  WebButton.Top := WizardForm.CancelButton.Top;
  WebButton.Width := WizardForm.CancelButton.Width;
  WebButton.Height := WizardForm.CancelButton.Height;
  WebButton.Caption := '��ҳ(&H)';
  WebButton.OnClick := @WebButtonOnClick;
  WebButton.Parent := WizardForm;

  //�˵������
  MenuCaptions[0] := 'Inno Setup ��ҳ';
  MenuCaptions[1] := '��Ҷ����';
  MenuCaptions[2] := '��Ҷ���� ��ҳ';
  MenuCaptions[3] := '��Ҷ���� ��̳';
  MenuCaptions[4] := '��Ҷ���� ����';
  MenuCaptions[5] := '��Ҷ���� ����';

  MenuTexts[0] := 'http://www.jrsoftware.org/';
  MenuTexts[2] := 'http://www.skygz.com/';
  MenuTexts[3] := 'http://bbs.skygz.com/';
  MenuTexts[4] := 'http://u.skygz.com/?skygz';
  MenuTexts[5] := 'http://blog.skygz.com/';

  PM := TPopupMenu.Create(WizardForm);
  PM.PopupOrientation := pdTop;
  For C := 0 To 1 do
    begin
      Item := TMenuItem.Create(WizardForm);
      Item.Caption := MenuCaptions[C];
      Item.Tag := C;
      If C <> 1 Then Item.OnClick := @PopupMenuOnClick;
      If C = 1 Then
      For J := 2 To MenuCount - 1 Do
      Begin
        SubItem := TMenuItem.Create(WizardForm);
        SubItem.Caption := MenuCaptions[J];
        SubItem.Tag := J;
        SubItem.OnClick := @PopupMenuOnClick;
        Item.Add(SubItem);
      End;
      PM.Items.Add(Item);
    end;

  //��������б�Ĵ�С
  WizardForm.TYPESCOMBO.Visible:= false;
  WizardForm.ComponentsList.Height := WizardForm.ComponentsList.Height + WizardForm.ComponentsList.Top - WizardForm.TYPESCOMBO.Top;
  WizardForm.ComponentsList.Top := WizardForm.TYPESCOMBO.Top;
  WizardForm.ComponentsList.Width := ScaleX(200);

  //����һ�������GroupBox
  InfoPanel := TPanel.Create(WizardForm);
  InfoPanel.Parent := WizardForm.SelectComponentsPage;
  InfoPanel.Caption := '';
  InfoPanel.Top := WizardForm.ComponentsList.Top;
  InfoPanel.Left := ScaleX(216);
  InfoPanel.Width := ScaleX(200);
  InfoPanel.Height := WizardForm.ComponentsList.Height;
  InfoPanel.BevelInner := bvRaised;
  InfoPanel.BevelOuter := bvLowered;
  InfoCaption := TNewStaticText.Create(WizardForm);
  InfoCaption.Parent := WizardForm.SelectComponentsPage;
  InfoCaption.Caption := '����';
  InfoCaption.Left := ScaleX(224);
  InfoCaption.Top := InfoPanel.Top - ScaleY(5);
  InfoCaption.Font.Color := clActiveCaption;

  // ������������
  Info := TNewStaticText.Create(WizardForm);
  Info.Parent := InfoPanel;
  Info.AutoSize := False;
  Info.Left := ScaleX(6);
  Info.Width := ScaleX(188);
  Info.Top := ScaleY(12);
  Info.Height := WizardForm.ComponentsList.Height - ScaleY(18);
  Info.Caption := '�ƶ�������ָ�뵽���֮�ϣ���ɼ�������������';
  Info.WordWrap := true;

  RemarkList[0]:='������������';
  RemarkList[1]:='�����������ļ�';
  RemarkList[2]:='������˵���ļ�';
  RemarkList[3]:='������Ӣ��';
  RemarkList[4]:='����������';
  WizardForm.ComponentsList.OnMouseMove:=@OnComponentsListMouseMove;

  TranPanel := TNewTranPanel.Create(WizardForm);
  TranPanel.Parent := WizardForm.WelcomePage;
  TranPanel.Left := WizardForm.WizardBitmapImage.Left;
  TranPanel.Top := WizardForm.WizardBitmapImage.Top;
  TranPanel.Width := WizardForm.WizardBitmapImage.Width;
  TranPanel.Height := WizardForm.WizardBitmapImage.Height Div 2;

  ChkBox := TCheckBox.Create(WizardForm);
  ChkBox.Parent := TranPanel;
  ChkBox.Caption := '����������͸�� Panel';
  ChkBox.Width := 150;
  ChkBox.Top := TranPanel.Height Div 2 - 5;
  ChkBox.Left := TranPanel.Width Div 2 - ChkBox.Width Div 2;
  ChkBox.OnClick := @OnChkBoxClick;

  With TLabel.Create(WizardForm) Do
  Begin
    Parent := TranPanel;
    Caption := '�������'+#13#10+'WizardBitmapImageͼ��'+#13#10+'���Ե���¼�';
    Top := ChkBox.Top + 30;
  End;
  WizardForm.WizardBitmapImage.OnClick := @OnWizardBitmapImageClick;
end;
