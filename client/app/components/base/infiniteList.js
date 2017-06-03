// @flow
import React, { Element, PureComponent } from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import VisibilitySensor from 'react-visibility-sensor';

export type Props = {
    canLoadMore: bool,
    onLoadMore: () => void,
    children?: Element<any>,
};

const INDIC_STYLE = {
    transform: 'unset',
    top: 'unset',
    right: 'unset',
    position: 'static',
    margin: '8px auto',
};

export default class InfiniteList extends PureComponent {
    componentWillMount() {
        this.scrollBottom = 0;

        this.onVisibilityChange = (isVisible: boolean) => {
            if (isVisible) {
                this.props.onLoadMore();
            }
        };

        this.handleRef = (node: HTMLDivElement) => {
            this.node = node;
        };
    }

    componentDidMount() {
        this.restoreScroll();
    }

    componentWillUpdate() {
        const scroll = this.node.scrollTop + this.node.offsetHeight;
        this.scrollBottom = this.node.scrollHeight - scroll;
    }

    componentDidUpdate() {
        this.restoreScroll();
    }

    restoreScroll() {
        const scroll = this.scrollBottom + this.node.offsetHeight;
        this.node.scrollTop = this.node.scrollHeight - scroll;
    }

    node: HTMLDivElement;
    scrollBottom: number;
    props: Props;

    render() {
        const {
            canLoadMore,
            onLoadMore, // eslint-disable unused
            ...other
        } = this.props;

        return (
            <div {...other} ref={this.handleRef}>
                {canLoadMore && (
                    <VisibilitySensor
                        partialVisibility scrollCheck delayedCall
                        containment={this.node}
                        onChange={this.onVisibilityChange}>
                        <RefreshIndicator
                            size={50} top={8} left={8}
                            status="loading" style={INDIC_STYLE} />
                    </VisibilitySensor>
                )}
                {this.props.children}
            </div>
        );
    }
}
