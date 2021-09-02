import outgoingVideo from '../assets/icon-call-video-outgoing-filled.svg';
import incomingVideo from '../assets/icon-call-video-incoming-filled.svg';
import outgoingVoice from '../assets/icon-call-voice-outgoing-filled.svg';
import incomingVoice from '../assets/icon-call-voice-incoming-filled.svg';
import avatarIcon from '../assets/icon-avatar.svg';

import { createListItem, createDiv, createImg, createLabel } from "../utils/domUtil";
import { classes } from "../css/styles";

export class CallLogItem {
  constructor({ callLogInfo, className }) {
    if(callLogInfo) {
      const wrapper = createListItem({ id: callLogInfo.callId, className: className });
      let callType;
      let callTypeAlt;
      if(callLogInfo.isVideoCall){
        if(callLogInfo.userRole === 'dc_caller'){
          callType = outgoingVideo;
          callTypeAlt = 'Outgoing call history';
        } else {
          callType = incomingVideo;
          callTypeAlt = 'Incoming call history';
        }
      } else {
        if(callLogInfo.userRole === 'dc_caller'){
          callType = outgoingVoice;
          callTypeAlt = 'Outgoing call history';
        } else {
          callType = incomingVoice;
          callTypeAlt = 'Incoming call history';
        }
      }

      let profileImage;
      let displayName;
      let displayId;
      if(callLogInfo.userRole === 'dc_caller'){
        profileImage = callLogInfo.callee.profileUrl;
        displayName = callLogInfo.callee.nickname || '—';
        displayId = callLogInfo.callee.userId;
      } else {
        profileImage = callLogInfo.caller.profileUrl;
        displayName = callLogInfo.caller.nickname || '—';
        displayId = callLogInfo.caller.userId;
      }

      const icoCallType = createImg({ className: `${classes['callLogItemType']}`, src: callType, alt: callTypeAlt });
      const callTypeDiv = createDiv({ className: `${classes['callLogTypeDiv']}` });
      callTypeDiv.appendChild(icoCallType);

      const profileImg = createImg({
        className: `${classes['callLogProfileImg']}`,
        src: profileImage,
        alt: 'Opponent profile photo of call history',
        onerror: (error) => {
          error.currentTarget.src = avatarIcon;
        }
      });

      const profileDiv = createDiv({ className: `${classes['callLogProfileDiv']}` });
      profileDiv.appendChild(profileImg);

      //duration
      let callDurationTime = '';
      if(callLogInfo.duration > 0){
        let tempDuration = Math.ceil(callLogInfo.duration / 1000);
        let hour = parseInt(tempDuration / 3600);
        let min = parseInt((tempDuration - (hour * 3600)) / 60);
        let sec = tempDuration - (hour * 3600) - (min * 60);
        if(hour > 0){
          callDurationTime = hour + 'h ';
        }
        if(min > 0){
          callDurationTime += (min + 'm ');
        }
        callDurationTime += (sec + 's');
      } else {
        callDurationTime = '0s';
      }

      const displayNameLabel = createLabel({
        className: `${classes['callLogDisplayName']} ${classes['fontNormal']} ${classes['fontHeavy']}`,
        innerText: displayName
      });
      const displayIdLabel = createLabel({
        className: `${classes['callLogDisplayId']} ${classes['fontSmall']}`,
        innerText: `User ID: ${displayId}`
      });
      const callEndInfo = createLabel({
        className: `${classes['callLogEndInfo']} ${classes['fontSmall']}`,
        innerText: `${callLogInfo.endResult} · ${callDurationTime}`
      });


      const callLogInfoDiv = createDiv({ className: `${classes['callLogInfoDiv']}` });
      callLogInfoDiv.appendChild(displayNameLabel);
      callLogInfoDiv.appendChild(displayIdLabel);
      callLogInfoDiv.appendChild(callEndInfo);


      let callStartTime = new Date(callLogInfo.startedAt);
      let callStartTimeLabel = `${callStartTime.getFullYear()}/${callStartTime.toLocaleString(['en-US'], {month: '2-digit'})}/${callStartTime.toLocaleString(['en-US'], {day: '2-digit'})} ${this.formatAMPM(callStartTime)}`;

      const callLogStartTime = createLabel({ className: `${classes['callLogStartTime']} ${classes['fontSmall']}`, innerText: callStartTimeLabel});
      const callActionBtnWrap = createDiv({ className: `${classes['callLogActionBtnWrap']}` });
      const btnCallVideo = createDiv({ className: `${classes['callLogVideoActionBtn']}`});
      const btnCallVoice = createDiv({ className: `${classes['callLogVoiceActionBtn']}`});
      callActionBtnWrap.appendChild(btnCallVoice);
      callActionBtnWrap.appendChild(btnCallVideo);


      const callLogActionDiv = createDiv({ className: `${classes['callLogActionDiv']}` });
      callLogActionDiv.appendChild(callLogStartTime);
      callLogActionDiv.appendChild(callActionBtnWrap);


      wrapper.appendChild(callTypeDiv);
      wrapper.appendChild(profileDiv);
      wrapper.appendChild(callLogInfoDiv);
      wrapper.appendChild(callLogActionDiv);

      this.element = wrapper;
      this.btnCallVideo = btnCallVideo;
      this.btnCallVoice = btnCallVoice;
      this.destPeerID = displayId;
    } else {
      const wrapper = createDiv({ id: 'empty_calllog', className: className });
      const icoCallLogEmpty = createDiv({ className: `${classes['icoCallLogEmpty']}` });
      const labelCallLogEmpty = createDiv({
        innerText: 'The list of calls you make will show here.\nTap the phone button to start making a call.',
        className: `${classes['labelCallLogEmpty']} ${classes['fontSmall']}`
      });
      wrapper.appendChild(icoCallLogEmpty);
      wrapper.appendChild(labelCallLogEmpty);

      this.element = wrapper;
    }
  }

  formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ampm;
    return strTime;
  }

  /**
   * @param {(event: any, args: any) => void} eventhandler
   */
  set onclick(eventhandler) {
    this.btnCallVideo.onclick = (event) => {
      eventhandler(event, {peerId: this.destPeerID, isVideoCall: true, callOption: null});
    };
    this.btnCallVoice.onclick = (event) => {
      eventhandler(event, {peerId: this.destPeerID, isVideoCall: false, callOption: null});
    };
  }
}
