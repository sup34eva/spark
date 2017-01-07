const {
    GraphQLString,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLInputObjectType,
} = require('graphql');

function resolveMaybeThunk(thingOrThunk) {
    return typeof thingOrThunk === 'function' ? thingOrThunk() : thingOrThunk;
}

exports.subscriptionWithClientSubscriptionId = config => {
    const {
        name, description,
        inputFields, outputFields,
        start, stop,
    } = config;

    const augmentedInputFields = () =>
        Object.assign({}, resolveMaybeThunk(inputFields), {
            clientSubscriptionId: {
                type: GraphQLString
            }
        });

    const inputType = new GraphQLInputObjectType({
        name: name + 'Input',
        fields: augmentedInputFields
    });

    const outputType = new GraphQLObjectType({
        name: name + 'Message',
        fields: outputFields
    });

    return {
        type: outputType,
        description,
        args: {
            input: {
                type: new GraphQLNonNull(inputType),
            },
        },
        resolve(root, { input }, ctx, info) {
            const publish = data => {
                ctx.socket.emit(input.clientSubscriptionId, {
                    [info.fieldName]: data,
                });
            };

            return Promise.resolve(
                start(publish, input, ctx, info)
            ).then(payload => {
                ctx.socket.on('disconnect', () => {
                    stop(payload, input, ctx, info);
                });

                return input;
            });
        },
    };
};
