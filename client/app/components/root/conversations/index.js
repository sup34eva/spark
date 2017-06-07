// @flow
import React, { Component } from 'react';
import { TabRouter, addNavigationHelpers } from 'react-navigation';

import Drawer from './drawer';
import Conversation from './conversation';
import styles from './conversations.css';

export const DetailsRouter = new TabRouter({
    ConvClose: {
        screen: () => null,
    },
    ConvOpen: {
        screen: Conversation,
    },
}, {
    initialRouteName: 'ConvClose',
});

export default class DetailsNavigator extends Component {
    static router = DetailsRouter;

    props: {
        navigation: {
            /* eslint-disable react/no-unused-prop-types */
            dispatch: Function,
            state: {
                index: number,
                routes: Array<Object>,
            },
            /* eslint-enable react/no-unused-prop-types */
        },
    };

    render() {
        const rootNavigation = this.props.navigation;
        const { state, dispatch } = rootNavigation;
        const { routes, index } = state;

        const route = routes[index];
        const childNavigation = addNavigationHelpers({ dispatch, state: route });
        const ChildComponent = DetailsRouter.getComponentForRouteName(route.routeName);

        return (
            <div className={styles.convNavigator}>
                <Drawer routeName={state.routeName} navigation={childNavigation} />
                <ChildComponent key={route.key} navigation={childNavigation} />
            </div>
        );
    }
}
