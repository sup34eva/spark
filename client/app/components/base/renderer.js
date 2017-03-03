// @flow
import React from 'react';
import Relay from 'react-relay';
import CircularProgress from 'material-ui/CircularProgress';
import RaisedButton from 'material-ui/RaisedButton';
import AlertWarning from 'material-ui/svg-icons/alert/warning';
import { environment } from '../../utils/relay';

type Props = {
    Container: React.Element<*>,
    queryConfig: Relay.Route,
    padding: ?number,
};

const centered = (padding = 0) => ({
    position: 'absolute',
    top: '50%',
    left: `calc(50% + ${padding}px)`,
    transform: 'translate(-50%, -50%)',
});

export default ({ Container, queryConfig, padding }: Props) => (
    <Relay.Renderer
        Container={Container}
        environment={environment}
        queryConfig={queryConfig}
        render={({ error, props, retry }) => {
            if (error) {
                return (
                    <div style={{
                        ...centered(padding),
                        textAlign: 'center',
                    }}>
                        <AlertWarning color="rgba(0, 0, 0, .87)" style={{
                            height: 50,
                            width: 50,
                        }} />
                        <p>{error.message}</p>
                        <RaisedButton label="Try again" onTouchTap={retry} />
                    </div>
                );
            }

            if (props) {
                return <Container {...props} />;
            }

            return <CircularProgress size={80} thickness={5} style={centered(padding)} />;
        }} />
);
