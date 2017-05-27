// @flow
import getMuiTheme from 'material-ui/styles/getMuiTheme';

// Main Primary color
export const primary0 = '#6371C9';
export const primary1 = '#B8C0F1';
export const primary2 = '#8995DE';
export const primary3 = '#4554B1';
export const primary4 = '#2B3BA0';

// Main Secondary color (1)
export const secondary10 = '#CA54BC';
export const secondary11 = '#F1B0E9';
export const secondary12 = '#DF7DD3';
export const secondary13 = '#B335A3';
export const secondary14 = '#A21A91';

// Main Secondary color (2)
export const secondary20 = '#5CDD5C';
export const secondary21 = '#B3F6B3';
export const secondary22 = '#83EA83';
export const secondary23 = '#3DCD3D';
export const secondary24 = '#1DBB1D';

export default getMuiTheme({
    palette: {
        primary1Color: primary0,
        primary2Color: primary1,
        primary3Color: primary4,
        accent1Color: secondary10,
        accent2Color: secondary20,
        accent3Color: secondary24,
    },
});
