// @flow
import React, { Component } from 'react';
import { StackRouter, addNavigationHelpers } from 'react-navigation';

import TextConv from './text';
import VideoCall from './video';

export const ConvRouter = new StackRouter({
    Conversation: {
        screen: TextConv,
    },
    Video: {
        screen: VideoCall,
    },
}, {
    initialRouteName: 'Conversation',
});

export default class ConvNavigator extends Component {
    static router = ConvRouter;

    props: {
        navigation: {
            dispatch: Function,
            state: {
                /* eslint-disable react/no-unused-prop-types */
                index: number,
                routes: Array<Object>,
                /* eslint-enable react/no-unused-prop-types */
            },
        },
    };

    render() {
        const { state, dispatch } = this.props.navigation;
        const { routes, index } = state;

        const route = routes[index];
        const childNavigation = addNavigationHelpers({ dispatch, state: route });
        const ChildComponent = ConvRouter.getComponentForRouteName(route.routeName);

        return (
            <ChildComponent
                key={route.key}
                channel={state.params.channel}
                navigation={childNavigation} />
        );
    }
}
