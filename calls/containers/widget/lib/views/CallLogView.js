import SendBirdCall from "sendbird-calls";
import BaseElement from "../components/BaseElement";
import { classes } from "../css/styles.js";
import { createList, createDiv } from "../utils/domUtil";
import { CallLogItem } from "./CallLogItem";

export default class CallLogView extends BaseElement{
  constructor({ args }) {
    super({
      id: 'calllog_view',
      className: `${classes['container']} ${classes['center']} ${classes['viewDial']}`,
      args
    });

    this.callLogQuery = null;
    this.callLogQueryData = [];
  }

  build() {
    const callLogList = createList({ id: 'call_log_list', className: `${classes['callLogListContainer']}` });
    this.callLogQuery = SendBirdCall.createDirectCallLogListQuery({ limit: 30 });
    this.getDirectCalls(callLogList);
    callLogList.onscroll = (e) => {
      let scrollposition = e.target.scrollHeight - e.target.clientHeight;
      if(scrollposition === e.target.scrollTop) {
        this.getDirectCalls(callLogList);
      }
    };

    if(this.args.isWidget) {
      callLogList.classList.add(classes['widgetCallLog']);
      this.element.appendChild(callLogList);
    } else {
      const callLogDescription = createDiv({ id: 'call_log_desc', className: `${classes['callLogListDesc']}` });
      const callLogDescLogo = createDiv({ className: `${classes['callLogDescLogo']}` });
      const callLogDescTitle = createDiv({ innerText: 'Sendbird Calls Quickstart', className: `${classes['callLogDescTitle']} ${classes['font24']} ${classes['fontDemi']}` });
      const callLogDescLabel = createDiv({ innerText: 'This is the Sendbird Calls Quickstart page.', className: `${classes['callLogDescLabel']} ${classes['fontNormal']} ${classes['fontHeavy']}` });
      callLogDescription.appendChild(callLogDescLogo);
      callLogDescription.appendChild(callLogDescTitle);
      callLogDescription.appendChild(callLogDescLabel);

      this.element.appendChild(callLogList);
      this.element.appendChild(callLogDescription);
    }
  }

  getDirectCalls(element){
    if (!this.callLogQuery.hasNext || this.callLogQuery.isLoading) return;
    this.callLogQuery.next((directCallLog) => {
      if( directCallLog.length > 0 ) {
        for(let callLogItem of directCallLog) {
          const callItem = new CallLogItem({ callLogInfo: callLogItem, className: `${classes['callLogItemWrap']}` });
          callItem.onclick = (event, args) => {
            this.sendToParent('dial', args);              
          };

          element.appendChild(callItem.element);
        }
      } else {
        // empty call log
        const emptyCallLog = new CallLogItem({ className: `${classes['callLogEmptyWrap']}` });
        element.appendChild(emptyCallLog.element);
      }
    });
  }
}
