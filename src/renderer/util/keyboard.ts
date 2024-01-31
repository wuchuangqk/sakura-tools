import Mousetrap from 'mousetrap'

const keyBindings: IKeyBindings = {
  'space': 'togglePlay',
  'a': 'prevKeyFrame',
  'd': 'nextKeyFrame',
  'q': 'setSegmentStart',
  'e': 'setSegmentEnd',
}

export const bindKeyboard = (actions: IKeyboardActions) => {
  Object.keys(keyBindings).forEach(key => {
    Mousetrap.bind(key, actions[keyBindings[key]])
  })
}