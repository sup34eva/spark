// @flow
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {
  cyan500, cyan700, lightGreen500,
  grey100, grey400, grey500,
} from 'material-ui/styles/colors';

export default getMuiTheme({
    palette: {
        primary1Color: cyan500,
        primary2Color: cyan700,
        primary3Color: grey400,

        accent1Color: lightGreen500,
        accent2Color: grey100,
        accent3Color: grey500,
    },
});
