import {Message} from "element-ui"

export const showInfo = message => {
  Message.closeAll()
  Message.info(message)
}