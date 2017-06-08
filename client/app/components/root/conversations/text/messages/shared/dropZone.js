// @flow
import React, { Element, PureComponent } from 'react';

export type Props = {
    className: ?string,
    children?: Element<any>,
    onDrop: (Array<File>) => void,
};

const onDragOver = (evt: DragEvent) => {
    evt.preventDefault();
};

export default class DropZone extends PureComponent<void, Props, void> {
    componentWillMount() {
        this.onDrop = (evt: DragEvent) => {
            evt.preventDefault();
            if (evt.dataTransfer) {
                const { items, files } = evt.dataTransfer;
                const blobs = Array.from(items || files).map(entry => {
                    if (entry.kind === 'file') {
                        // $FlowIssue
                        return entry.getAsFile();
                    }

                    // $FlowIssue
                    return entry;
                });

                this.props.onDrop(blobs);
            }
        };
    }

    props: Props;

    render() {
        return (
            <div className={this.props.className} onDrop={this.onDrop} onDragOver={onDragOver}>
                {this.props.children}
            </div>
        );
    }
}
