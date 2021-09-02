import jss from 'jss'
import preset from 'jss-preset-default'

/*** assets ***/
import logoMid from '../assets/ic-logo-inverse-01.svg';
import logoMidBlack from '../assets/ic-logo-black-01.svg';
import logoBig from '../assets/ic-logo-horizontal-purple-300.svg';
import audioIcon from '../assets/ic-callkit-audio.svg';
import audioIcon20 from '../assets/ic-callkit-audio-20.svg';
import videoIcon from '../assets/icon-call-video.svg';
import videoPurpleIcon from '../assets/ic-video-thumbnail-purple.svg';
import videoWhiteIcon from '../assets/ic-video-thumbnail-white.svg';
import videoBlackIcon from '../assets/ic-video-thumbnail-black.svg';
import audioOffBlack from '../assets/ic-callkit-audio-off-black.svg';
import audioOffWhite from '../assets/ic-callkit-audio-off-white.svg';
import cameraOff from '../assets/icon-camera-off.svg';
import declineWhiteIcon from '../assets/ic-callkit-decline.svg';
import declineBlackIcon from '../assets/ic-decline-black.svg';
import endIcon from '../assets/ic-callkit-end.svg';
import toastErrorIcon from '../assets/ic-error-20.svg';
import toastCloseBtn from '../assets/ic-close-20.svg';
import widgetIcon from '../assets/ic-call-white.svg';
import settingsIcon from '../assets/ic-settings.svg';
import settingsCloseIcon from '../assets/ic-close-black-20.svg';
import widgetCloseIcon from '../assets/ic-close-24.svg';
import arrowDownIcon from '../assets/ic-input-arrow-down.svg';
import avatarIcon from '../assets/icon-avatar.svg';
import dialIconActive from '../assets/ic-call-filled-active.svg';
import dialIconDeactive from '../assets/ic-call-filled-deactive.svg';
import callhistoryIconDeactive from '../assets/ic-layout-default-deactive.svg';
import callhistoryIconActive from '../assets/ic-layout-default-active.svg';
import headerLogo from '../assets/ic-logo-horizontal-inverse-01.svg';
import thumbnailVideo from '../assets/ic-video-thumbnail-filled.svg';
import thumbnailVoice from '../assets/ic-call-filled-purple.svg';
import callLogEmpty from '../assets/ic-layout-default.svg';
import logoHorizon from '../assets/ic-logo-horizontal.svg';
import icCopy from '../assets/ic-copy.svg';



const option = Object.assign(
  {},
  preset(),
  {
    createGenerateId: () => {
      return (rule, sheet) => `sendbird-sample-${rule.key}`;
    }
  }
);

jss.setup(option);

const colors = {
  navy50: '#f6f8fc',
  navy80: '#eef2fa',
  navy100: '#dee2f2',
  navy200: '#c9d0e6',
  navy300: '#b6bdd7',
  navy400: '#8a92ba',
  navy600: '#595e8a',
  navy800: '#353761',
  navy900: '#212242',
  white: '#ffffff',
  purple50: '#ededff',
  purple300: '#825eeb',
  purple400: '#6440c4',
  green300: '#1fcca1',
  green400: '#00998c',
  green500: '#007a7a',
  red300: '#f24d6b',
  red400: '#d92148',
  mutegray: 'rgba(168, 168, 168, 0.38)'
};

const styles = {
  mainApp: {
  },

  center: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  right: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  column: {
    display: 'flex',
    flexDirection: 'column'
  },

  row: {
    display: 'flex',
    flexDirection: 'row'
  },

  content: {
    marginBottom: 'auto',
    width: '100%'
  },

  grow1: {
    flexGrow: 1
  },

  grow2: {
    flexGrow: 2
  },

  grow3: {
    flexGrow: 3
  },

  grow4: {
    flexGrow: 4
  },

  btn: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    border: 'none',
    borderRadius: '4px',
    height: '40px',
    '& label': {
      cursor: 'inherit'
    },
    backgroundColor: colors.white
  },

  btnPrimary: {
    backgroundColor: colors.purple300,
    color: colors.white
  },

  btnBig: {
    width: '180px',
    height: '50px',
    marginLeft: '16px',
    marginRight: '16px'
  },

  btnMid: {
    width: '80px',
    height: '40px',
  },

  btns: {
    marginTop: '16px'
  },

  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  hidden: {
    display: 'none !important'
  },

  invisible: {
    visibility: 'hidden'
  },

  avatar: {
    flexShrink: '0',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    marginLeft: '24px',
    marginRight: '16px',
    backgroundImage: `url(${avatarIcon})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },

  profileSmall: {
    flexShrink: '0',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    marginLeft: '24px',
    marginRight: '16px',
    backgroundImage: data => `url(${data.profileUrl})`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },

  logoMid: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: `${colors.white}`,
    backgroundImage: `url(${logoMid})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    marginBottom: '16px'
  },

  logoBig: {
    display: 'block',
    width: '180px',
    height: '40px',
    background: `url(${logoBig})`,
    marginBottom: '24px'
  },

  headerLogo: {
    display: 'block',
    width: '100%',
    height: '24px',
    backgroundImage: `url(${headerLogo})`,
    backgroundRepeat: 'no-repeat',
    marginLeft: '16px'
  },


  /*** views ***/
  view: {
    boxSizing: 'border-box',
    // width: '100vw',
    width: '100%',
    height: '100%',
    padding: '24px',
    display: 'relative'
  },

  viewDial: {
    height: 'calc(100% - 110px)',
    color: colors.navy900,
    '& $content': {
      marginTop: 'auto'
    },
    '& $formContainer': {
      border: 'none'
    }
  },

  viewLogin: {
    backgroundColor: colors.navy50,
    color: colors.navy900,
    '& $content': {
      marginTop: '134px'
    }
  },

  viewCall: {
    backgroundColor: colors.navy900,
    color: colors.white
  },

  viewSettings: {
    position: 'absolute',
    left: '0px',
    top: '0px',
    width: '100%',
    height: '100%',
    zIndex: '100',
    overflow: 'hidden',
    borderRadius: 'inherit'
  },

  settingsCloseButton: {
    display: 'inline-flex',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    backgroundImage: `url(${settingsCloseIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },

  cover: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
    backgroundColor: colors.navy800
  },

  popup: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '480px',
    paddingTop: '16px',
    paddingBottom: '24px',
    paddingLeft: '24px',
    paddingRight: '24px',
    zIndex: '1',
    boxShadow: '0 6px 10px -5px rgba(33, 34, 66, 0.04), 0 6px 30px 5px rgba(33, 34, 66, 0.08), 0 16px 24px 2px rgba(33, 34, 66, 0.12)',
    borderRadius: '4px',
    backgroundColor: colors.white
  },

  popupHeader: {
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },

  popupTitle: {
    display: 'inline-flex',
    width: 'calc(100% - 20px)'
  },

  popupItemLabel: {
    display: 'inline-block',
    width: '100%',
    height: '12px',
    marginTop: '22px',
    marginBottom: '6px',
    lineHeight: '12px !important'
  },

  widgetpopup: {
    width: '312px',
    marginBottom: '2px'
  },

  appInfoLabelWrap: {
    display: 'flex',
    width: '100%',
    height: '40px',
    borderRadius: '4px',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.navy80,
  },

  appInfoLabel: {
    display: 'inline-flex',
    width: 'calc(100% - 60px)',
    height: '40px',
    borderRadius: '4px',
    paddingLeft: '16px',
    lineHeight: '40px !important',
    textOverflow: 'clip',
    overflow: 'hidden',
    backgroundColor: colors.navy80,
    color: colors.nany600,
  },

  appName: {
    width: 'calc(100% - 16px) !important'
  },

  appInfoIdLabel: {
    textOverflow: 'clip',
    overflow: 'hidden',
    whiteSpace: 'pre'
  },

  appInfoIdCopy: {
    display: 'inline-flex',
    width: '32px',
    height: '32px',
    borderRadius: '4px',
    marginRight: '4px',
    backgroundImage: `url(${icCopy})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    cursor: 'pointer'
  },

  /*** fonts ***/
  fontSmall: {
    fontFamily: 'Avenir Next',
    fontSize: '12px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    color: colors.navy900,
    lineHeight: 'normal',
    letterSpacing: 'normal',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  fontNormal: {
    fontFamily: 'Avenir Next',
    fontSize: '14px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    color: colors.navy900,
    lineHeight: '1.43',
    letterSpacing: 'normal',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  fontMidBig: {
    fontFamily: 'Avenir Next',
    fontSize: '18px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    color: colors.navy900,
    lineHeight: '1.33',
    letterSpacing: '-0.25px',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  font16: {
    fontFamily: 'Avenir Next',
    fontSize: '16px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    color: colors.navy900,
    lineHeight: '1.25',
    letterSpacing: '-0.15px',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  font20: {
    fontFamily: 'Avenir Next',
    fontSize: '20px',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.33',
    letterSpacing: '-0.25px',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  font24: {
    fontFamily: 'Avenir Next',
    fontSize: '24px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    color: colors.navy900,
    lineHeight: '1.33',
    letterSpacing: '-0.25px',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  fontBig: {
    fontFamily: 'Avenir Next',
    height: '32px',
    fontSize: '24px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: '1.33',
    letterSpacing: '-0.25px',
    textRendering: 'optimizelegibility',
    '-webkit-font-smoothing': 'antialiased',
    '-moz-osx-font-smoothing': 'grayscale'
  },

  fontHeavy: {
    fontWeight: 500
  },

  fontDemi: {
    fontWeight: 600
  },

  fontColorWhite: {
    color: colors.white
  },

  fontReadOnlyColor: {
    color: colors.navy600
  },

  /*** tab ***/
  tabToolBar: { 
    position: 'relative',
    display: 'inline-flex',
    justifyContent: 'center',
    width: '100%',
    height: '55px',
    backgroundColor: colors.white,
    textAlign: 'center',
    borderTop: 'solid 1px #dee2f2',
    borderBottom: 'solid 1px #dee2f2'
  },

  tabToolBarWidget: {
    position: 'absolute',
    display: 'inline-block',
    bottom: '0px',
    left: '0px',
    borderBottomLeftRadius: '8px',
    borderBottomRightRadius: '8px'
  },

  btnTab: {
    display: 'inline-block',
    width: '100px',
    height: '55px',
    cursor: 'pointer'
  },

  btnTabWidget: {
    width: '156px',
  },

  tabIco: {
    width: '100%',
    height: '32px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },

  dialActive: {
    backgroundImage: `url(${dialIconActive})`
  },

  dialDeactive: {
    backgroundImage: `url(${dialIconDeactive})`
  },

  btnTabCaption: {
    width: '100%',
    height: '12px',
    margin: 0,
    lineHeight: 1,
    textAlign: 'center'
  },

  icoTabCallLog: {
    width: '100%',
    height: '32px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  },

  callLogActive: {
    backgroundImage: `url(${callhistoryIconActive})`,
  },

  callLogDeactive: {
    backgroundImage: `url(${callhistoryIconDeactive})`,
  },

  btnTabActive: {
    color: colors.purple300
  },

  btnTabDeactive: {
    color: colors.navy600
  },

  /*** components ***/
  formContainer: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '500px',
    borderRadius: '4px',
    border: 'solid 1px #dee2f2',
    backgroundColor: colors.white,
    paddingLeft: '48px',
    paddingRight: '48px'
  },

  field: {
    boxSizing: 'border-box',
    width: '100%',
    height: '40px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '16px',
    borderRadius: '4px',
    border: `solid 1px ${colors.navy200}`,
    backgroundColor: colors.white,
    marginBottom: '16px'
  },

  dialField: {
    width: '312px'
  },

  fieldInvalid: {
    border: `solid 1px ${colors.red300}`
  },

  fieldLabel: {
    display: 'inline-block',
    height: '12px',
    marginTop: '6px',
    marginBottom: '6px',
    '&:first-of-type': {
      marginTop: '38px'
    }
  },

  dialTitle: {
    marginBottom: '32px'
  },

  /*** buttons ***/
  loginButton: {
    width: '100%',
    marginBottom: '40px'
  },

  dialButton: {
  },

  logoutButton: {
  },


  /*** misc ***/
  loginTitleDiv: {
    marginBottom: '40px'
  },

  hr: `
    width: calc(100% + 96px);
    height: 1px;
    border: 0;
    border-top: 1px solid ${colors.navy100};
    margin-left: -48px;
    margin-top: 10px;
    margin-bottom: 23px;
  `,

  error: {
    marginBottom: '8px',
    color: colors.red300
  },

  remoteProfile: `
    display: block;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: contain;
    margin-bottom: 24px;
  `,

  peerName: `
    min-height: 32px;
    height: auto;
    text-align: center;
    word-break: break-all;
    margin-bottom: 4px;
  `,

  connectionInfo: `
    height: 20px;
    margin-bottom: 24px;
  `,

  peerStateDiv: `
    align-items: center;
    margin-bottom: 97px;
  `,

  peerMuteIcon: `
    width: 32px;
    height: 32px;
    background-image: url(${audioOffWhite});
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 8px;
  `,

  peerMuteLabel: `
    display: block;
  `,

  peerVideoMuteIcon: `
    width: 40px;
    height: 40px;
    background-image: url(${cameraOff});
    background-repeat: no-repeat;
    background-position: center;
    margin-bottom: 16px;
  `,

  peerVideoMuteLabel: `
    display: block;
  `,


  callButtons: {
    position: 'relative'
  },

  callButtonsWidget: {
    position: 'absolute',
    bottom: '40px'
  },

  btnCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: colors.white,
    borderColor: 'transparent',
    cursor: 'pointer',
    '&::before': {
      content: '',
      display: 'block',
      width: '56px',
      height: '56px',
      borderRadius: '50%'
    },
    'btn-circle:hover::before': {
      backgroundColor: colors.mutegray
    }
  },

  btnCall: {
    marginLeft: '10px',
    marginRight: '10px'
  },

  btnVideoAccept: {
    backgroundColor: '#2eba9f',
    backgroundImage: `url(${videoIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover': {
      backgroundColor: colors.green500
    }
  },

  btnAccept: {
    backgroundColor: '#2eba9f',
    backgroundImage: `url(${audioIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover': {
      backgroundColor: colors.green500
    }
  },

  btnMute: {
    backgroundColor: colors.mutegray,
    backgroundImage: `url(${audioOffWhite})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover': {
      backgroundColor: 'rgba(168, 168, 168, 0.5)'
    }
  },

  btnUnmute: {
    backgroundColor: colors.white,
    backgroundImage: `url(${audioOffBlack})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover': {
      backgroundColor: 'rgba(168, 168, 168, 0.5)'
    }
  },

  btnStopVideo: {
    backgroundColor: colors.mutegray,
    backgroundImage: `url(${videoWhiteIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover': {
      backgroundColor: 'rgba(168, 168, 168, 0.5)'
    }
  },

  btnStartVideo: {
    backgroundColor: colors.white,
    backgroundImage: `url(${videoBlackIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover': {
      backgroundColor: 'rgba(168, 168, 168, 0.5)'
    }
  },

  btnEnd: {
    backgroundColor: '#e53157',
    backgroundImage: `url(${endIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: '32px',
    backgroundPosition: 'center',
    '&:hover' : {
      backgroundColor: '#a30e2d',
    }
  },

  videoView: {
    position: 'absolute',
    height: '100%',
    left: '50%',
    transform: 'translate(-50%)',
  },

  videoViewDiv: {
    position: 'absolute',
    overflow: 'hidden'
  },

  videoViewStopped: {
    '& $videoView': {
      visibility: 'invisible'
    }
  },

  videoFull: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: 'all 1s',
  },

  videoSmall: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    width: '200px',
    height: '150px',
    borderRadius: '8px',
    backgroundColor: colors.navy300,
    transition: 'all 1s'
  },

  videoHidden: {
    opacity: '0',
    transition: 'all 0.5s',
    display: 'none'
  },

  callBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },

  callBackgroundWidget: {
    borderRadius: '8px'
  },

  callForeground: {
    position: 'relative'
  },

  btnDecline: {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    backgroundImage: `url(${declineWhiteIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    '&:hover' : {
      backgroundColor: 'rgba(0, 0, 0, 0.38)',
    }
  },

  closeDiv: {},

  btnClose: {
    width: '248px',
    height: '48px',
    border: 'none',
    borderRadius: '4px',
    marginBottom: '28px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: colors.white,
    '&:hover': {
      cursor: 'pointer',
      background: 'rgba(255, 255, 255, 0.28)'
    }
  },

  '@keyframes fadein': {
    from: {
      bottom: 0,
      opacity: 0
    },
    to: {
      bottom: '24px',
      opacity: 1
    }
  },

  '@keyframes fadeout': {
    from: {
      opacity: 1
    },
    to: {
      bottom: 0,
      opacity: 0
    }
  },

  toast: {
    visibility: 'hidden',
    display: 'inline-flex',
    position: 'absolute',
    left: '32px',
    bottom: '24px',
    width: '33%',
    padding: '14px 16px',
    zIndex: '200',
    borderRadius: '4px',
    boxShadow: '0 6px 10px -5px rgba(33, 34, 66, 0.04), 0 6px 30px 5px rgba(33, 34, 66, 0.08), 0 16px 24px 2px rgba(33, 34, 66, 0.12)',
    backgroundColor: colors.red300
  },

  toastShow: {
    animation: '$fadein 0.5s'
  },

  toastHide: {
    animation: '$fadeout 0.5s'
  },

  toastErrorIcon: {
    boxSizing: 'border-box',
    alignSelf: 'start',
    width: '20px',
    height: '20px',
    paddingRight: '20px',
    objectFit: 'contain',
    backgroundColor: 'inherit',
    backgroundImage: `url(${toastErrorIcon})`
  },

  toastMsg: {
    marginLeft: '16px',
    color: colors.white
  },

  toastCloseBtn: {
    cursor: 'pointer',
    boxSizing: 'border-box',
    alignSelf: 'start',
    width: '20px',
    height: '20px',
    paddingLeft: '32px',
    marginLeft: 'auto',
    objectFit: 'contain',
    border: 'none',
    backgroundColor: 'inherit',
    backgroundImage: `url(${toastCloseBtn})`,
    backgroundPosition: 'right',
    backgroundRepeat: 'no-repeat'
  },

  selectContainer: {
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '500px',
    borderRadius: '4px',
    backgroundColor: colors.white
  },

  selectLabel: {
    display: 'inline-block',
    height: '12px',
    marginTop: '6px',
    marginBottom: '6px',
    '&:first-of-type': {
      marginTop: '16px'
    }
  },

  blockSelect: {
    appearance: 'none',
    display: 'block',
    width: '100%',
    height: '40px',
    marginBottom: '16px',
    paddingLeft: '16px',
    paddingRight: '36px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderRadius: '4px',
    border: `solid 1px ${colors.navy200}`,
    backgroundColor: colors.white,
    backgroundImage: `url(${arrowDownIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'calc(100% - 12px) center',
    '&:last-of-type': {
      marginBottom: '0'
    }
  },

  versionInfo: {
    display: 'none',
    position: 'absolute',
    width: '100%',
    bottom: '24px'
  },

  versionLabel: {
    marginLeft: '8px',
    marginRight: '8px'
  },

  /*** widget ***/
  widgetApp: {
    '& $fieldLabel': {
      '&:first-of-type': {
        marginTop: '0px'
      }
    },
    '& $viewLogin': {
      backgroundColor: colors.white,
      '& $content': {
        marginTop: '96px'
      },
      '& $versionInfo': {
        display: 'flex'
      },
      '& $closeButton': {
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundImage: `url(${declineBlackIcon})`
      }
    },
    '& $viewDial': {
      height: 'calc(100% - 136px)',
      '& $content': {
        // marginTop: '144px'
        margin: 'auto'
      },
      '& $versionInfo': {
        // display: 'flex'
        display: 'none'
      }
    },
    '& $widgetHeader': {
      flexDirection: 'row',
      height: '80px',
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
      '& $closeButton:hover': {
        backgroundColor: colors.purple400
      }
    },
    '& $userDiv': {
      cursor: 'auto',
      flexDirection: 'row'
    },
    '& $avatar': {
      width: '40px',
      height: '40px'
    },
    '& $headerDivider': {
      display: 'none'
    },
    '& $headerButtons': {
      marginLeft: 'auto',
      marginRight: '14px'
    },
    '& $settingsButton': {
      width: '48px',
      height: '48px'
    },
    '& $closeButton': {
      display: 'block'
    },
    '& $headerUserId': {
      display: 'block',
    },
    '& $formContainer': {
      boxSizing: 'border-box',
      paddingLeft: '24px',
      paddingRight: '24px',
      border: 'none'
    },
    '& $videoSmall': {
      width: '96px',
      height: '160px',
      borderRadius: '8px'
    },
    '& $toast': {
      left: 'calc((100% - 80% - 32px) / 2)',
      width: '80%'
    }
  },

  widgetDiv: {
    position: 'inherit',
    width: '376px',
    height: '592px',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 9px 15px -7px rgba(33, 34, 66, 0.04), 0 9px 46px 8px rgba(33, 34, 66, 0.08), 0 24px 38px 3px rgba(33, 34, 66, 0.12)',
    backgroundColor: colors.white,
    overflow: 'hidden',
  },

  widgetIcon: {
    cursor: 'pointer',
    width: '48px',
    height: '48px',
    borderRadius: '24px',
    backgroundColor: colors.purple300,
    backgroundImage: `url(${widgetIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    boxShadow: '0 5px 8px -4px rgba(33, 34, 66, 0.04), 0 5px 22px 4px rgba(33, 34, 66, 0.08), 0 12px 17px 2px rgba(33, 34, 66, 0.12)',
    marginBottom: '32px'
  },

  widgetHeader: {
    display: 'inline-flex',
    position: 'relative',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    height: '48px',
    backgroundColor: colors.purple300,
  },

  userDiv: {
    display: 'flex',
    cursor: 'pointer',
    flexDirection: 'row-reverse'
  },

  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },

  headerUserId: {
    display: 'none',
    whiteSpace: 'nowrap',
    color: colors.purple50
  },

  headerNickname: {
    whiteSpace: 'nowrap',
    color: colors.white
  },

  userDetail: {
    display: 'flex',
    flexDirection: 'row',
    '& $profileSmall': {
      width: '32px',
      height: '32px',
      marginLeft: '0px'
    },
    '& $avatar': {
      marginLeft: '0px'
    },
    '& $headerNickname': {
      color: colors.navy900
    },
    '& $headerUserId': {
      color: colors.navy600,
      display: 'block'
    },
  },

  menuItemsDiv: {
    position: 'absolute',
    top: '40px',
    right: '0',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '0px',
    paddingRight: '0px',
    minWidth: '248px',
    borderRadius: '4px',
    boxShadow: '0 3px 5px -3px rgba(33, 34, 66, 0.04), 0 3px 14px 2px rgba(33, 34, 66, 0.08), 0 8px 10px 1px rgba(33, 34, 66, 0.12)',
    backgroundColor: colors.white,
    zIndex: '1',
  },

  menuItem: {
    display: 'block',
    boxSizing: 'border-box',
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingLeft: '16px',
    paddingRight: '16px',
    width: '100%',
    height: 'auto',
    minHeight: '32px',
    textAlign: 'left',
    '&:hover': {
      backgroundColor: colors.navy50
    }
  },

  disabledMenuItem: {
    display: 'block',
    boxSizing: 'border-box',
    cursor: 'default',
    paddingTop: '0px',
    paddingBottom: '0px',
    paddingLeft: '16px',
    paddingRight: '16px',
    width: '100%',
    height: 'auto',
    minHeight: '32px',
    textAlign: 'left',
  },

  menuDivider: {
    width: '100%',
    height: '1px',
    marginTop: '8px',
    marginBottom: '8px',
    backgroundColor: colors.navy100
  },

  headerDivider: {
    width: '1px',
    height: '20px',
    marginLeft: '8px',
    marginRight: '16px',
    backgroundColor: colors.purple400
  },

  headerButtons: {
    marginLeft: '14px'
  },

  settingsButton: {
    position: 'relative',
    marginLeft: '2px',
    marginRight: '2px',
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundImage: `url(${settingsIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    zIndex: 10,
  },

  closeButton: {
    display: 'none',
    marginLeft: '2px',
    marginRight: '2px',
    width: '48px',
    height: '48px',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundImage: `url(${widgetCloseIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },

  logoMidBlack: {
    width: '56px',
    height: '56px',
    marginBottom: '8px',
    backgroundImage: `url(${logoMidBlack})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center'
  },

  btnVideo: {
    backgroundImage: `url(${videoPurpleIcon})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    border: `solid 1px ${colors.purple300}`
  },

  btnAudio: {
    backgroundImage: `url(${audioIcon20})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundColor: colors.purple300
  },

  /* call Log View */
  callLogListContainer: {
    display: 'inline-block',
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    listStyle: 'none',
    margin: '0',
    padding: '0',
    borderRight: 'solid 1px #dee2f2',
    'li': {
      '&:first-child': {
        borderTop: 'unset'
      }
    }
  },

  callLogListDesc: {
    display: 'inline-flex',
    position: 'absolute',
    width: 'calc(100% - 382px)',
    height: 'calc(100% - 103px)',
    margin: '0',
    padding: '0',
    right: '0px',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },

  callLogDescLogo: {
    display: 'block',
    position: 'relative',
    width: '100%',
    height: '40px',
    backgroundImage: `url(${logoHorizon})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },

  callLogDescTitle: {
    position: 'relative',
    width: '100%',
    height: '32px',
    textAlign: 'center',
    marginTop: '24px',
    color: colors.navy900
  },

  callLogDescLabel: {
    position: 'relative',
    width: '275px',
    height: '40px',
    textAlign: 'center',
    marginTop: '16px',
    color: colors.navy600
  },

  widgetCallLog: {
    height: '100%',
    width: '100%',
    overflowX: 'hidden',
  },

  /* call Log item */
  callLogItemWrap: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%',
    minHeight: '88px',
    height: 'auto',
    borderBottom: 'solid 1px #dee2f2',
  },

  callLogEmptyWrap: {
    position: 'relative',
    width: '312px',
    height: '116px',
    marginTop: '158px',
    marginLeft: '32px',
  },

  icoCallLogEmpty: {
    display: 'inline-block',
    width: '100%',
    height: '64px',
    backgroundImage: `url(${callLogEmpty})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  },

  labelCallLogEmpty: {
    display: 'inline-block',
    width: '100%',
    height: '20px',
    marginTop: '12px',
    textAlign: 'center',
    color: colors.navy600
  },

  callLogTypeDiv: {
    display: 'inline-flex',
    width: '44px',
    height: '100%'
  },

  callLogProfileDiv: {
    display: 'inline-flex',
    width: '32px',
    height: '100%'
  },

  callLogInfoDiv: {
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '156px',
    height: '100%'
  },

  callLogActionDiv: {
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'right',
    width: '136px',
    height: '100%'
  },

  callLogItemType: {
    display: 'block',
    width: '20px',
    height: '20px',
    marginLeft: '16px',
    marginTop: '24px',
  },

  callLogProfileImg: {
    display: 'block',
    width: '32px',
    height: '32px',
    marginTop: '18px',
    borderRadius: '50%'
  },

  callLogDisplayName: {
    display: 'inline-flex',
    width: '140px',
    height: 'auto',
    marginTop: '16px',
    marginLeft: '12px',
    wordBreak: 'break-all',
  },

  callLogDisplayId: {
    display: 'inline-flex',
    width: '140px',
    height: 'auto',
    marginLeft: '12px',
    wordBreak: 'break-all',
    color: colors.navy600,
  },

  callLogEndInfo: {
    display: 'inline-flex',
    width: '100%',
    height: '16px',
    marginLeft: '12px',
    marginTop: '8px',
    color: colors.navy600
  },

  callLogStartTime: {
    display: 'block',
    width: '120px',
    height: '16px',
    textAlign: 'right',
    marginTop: '18px',
    marginRight: '16px',
    color: colors.navy600
  },

  callLogActionBtnWrap: {
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '136px',
    height: '56px'
  },

  callLogVideoActionBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundImage: `url(${thumbnailVideo})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    marginRight: '12px',
    marginTop: '8px',
    backgroundColor: colors.navy80,
    cursor: 'pointer'
  },

  callLogVoiceActionBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundImage: `url(${thumbnailVoice})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    marginTop: '8px',
    marginRight: '16px',
    backgroundColor: colors.navy80,
    cursor: 'pointer'
  },

  welcomeDiv: {}
};

const sheet = jss.createStyleSheet(styles, {
  link: true
});
const classes = sheet.classes;

export { jss, sheet, classes };
