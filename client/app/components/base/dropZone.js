// @flow
import React, { Element, Component } from 'react';

export type Props = {
    className: ?string,
    children?: Element<any>,
    onDrop: (Array<File>) => void,
};

export default class DropZone extends Component<void, Props, void> {
    onDrop = (evt: DragEvent) => {
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
    }

    onDragOver = (evt: DragEvent) => {
        evt.preventDefault();
    }

    container: HTMLDivElement;
    props: Props;

    handleContainer = (container: HTMLDivElement) => {
        if (container) {
            // $FlowIssue
            container.addEventListener('drop', this.onDrop);
            // $FlowIssue
            container.addEventListener('dragover', this.onDragOver);
        } else {
            // $FlowIssue
            this.container.removeEventListener('drop', this.onDrop);
            // $FlowIssue
            this.container.removeEventListener('dragover', this.onDragOver);
        }

        this.container = container;
    }

    render() {
        return (
            <div ref={this.handleContainer} className={this.props.className}>
                {this.props.children}
            </div>
        );
    }
}
