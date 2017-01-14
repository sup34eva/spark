// @flow
import React from 'react';
import Relay from 'react-relay';
import rebound from 'rebound';

import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import styles from './list_messages.css';
import batch from '../utils/batch';

const system = new rebound.SpringSystem();

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity: 0,
            scale: 0.2,
            translate: 75,
        };
    }

    state: {
        opacity: number,
        scale: number,
        translate: number,
    };

    componentDidMount() {
        this.batch = batch(index => {
            this.timeout = setTimeout(() => {
                this.opacity = system.createSpring(60, 5);
                this.opacity.addListener({
                    onSpringUpdate: () => {
                        this.setState({
                            opacity: this.opacity.getCurrentValue(),
                        });
                    },
                });

                this.opacity.setCurrentValue(this.state.opacity, true);
                this.opacity.setEndValue(1);

                this.scale = system.createSpring(40, 3);
                this.scale.addListener({
                    onSpringUpdate: () => {
                        this.setState({
                            scale: this.scale.getCurrentValue(),
                        });
                    },
                });

                this.scale.setCurrentValue(this.state.scale, true);
                this.scale.setEndValue(1);

                this.translate = system.createSpring(50, 5);
                this.translate.addListener({
                    onSpringUpdate: () => {
                        this.setState({
                            translate: this.translate.getCurrentValue(),
                        });
                    },
                });

                this.translate.setCurrentValue(this.state.translate, true);
                this.translate.setEndValue(0);
            }, index * 25);
        });
    }

    componentWillUnmount() {
        if (this.batch) {
            this.batch.cancel();
            this.batch = null;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.opacity) {
            this.opacity.destroy();
            this.opacity = null;
        }
        if (this.scale) {
            this.scale.destroy();
            this.scale = null;
        }
        if (this.translate) {
            this.translate.destroy();
            this.translate = null;
        }
    }

    batch: any;
    timeout: any;
    opacity: any;
    scale: any;
    translate: any;

    props: {
        message: {
            author: number,
            content: string,
        },
    };

    render() {
        return (
            <div className={styles.message} style={{
                opacity: this.state.opacity,
            }}>
                <Avatar className={styles.avatar} style={{
                    transform: `scale(${this.state.scale}, ${this.state.scale})`,
                }}>
                    {this.props.message.author}
                </Avatar>
                <Paper className={styles.content} style={{
                    transform: `translateX(${this.state.translate}%)`,
                }}>
                    {this.props.message.content}
                </Paper>
            </div>
        );
    }
}

export default Relay.createContainer(Message, {
    fragments: {
        message: () => Relay.QL`
            fragment on Message {
                author
                content
            }
        `,
    },
});
