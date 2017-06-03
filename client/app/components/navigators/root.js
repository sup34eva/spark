// @flow
import React, { Component } from 'react';
import { TabRouter, addNavigationHelpers } from 'react-navigation';

import Profile from 'components/screens/profile';

import Sidebar from '../sidebar';
import styles from '../app.css';

import ConvNavigator from './conversations';

console.log(TabRouter);

export const RootRouter = new TabRouter({
    Profile: {
        screen: Profile,
    },
    Channels: {
        screen: ConvNavigator,
    },
    Groups: {
        screen: ConvNavigator,
    },
});

export default class RootNavigator extends Component {
    static router = RootRouter;

    props: {
        navigation: {
            dispatch: () => void,
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
        const ChildComponent = RootRouter.getComponentForRouteName(route.routeName);

        return (
            <div className={styles.rootNavigator}>
                <Sidebar navigation={childNavigation} />
                <ChildComponent navigation={childNavigation} />
            </div>
        );
    }
}
