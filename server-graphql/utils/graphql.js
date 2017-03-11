const {
    execute,
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
                type: GraphQLString,
            },
        });

    const inputType = new GraphQLInputObjectType({
        name: name + 'Input',
        fields: augmentedInputFields,
    });

    const outputType = new GraphQLObjectType({
        name: name + 'Message',
        fields: outputFields,
    });

    return {
        type: outputType,
        description,
        args: {
            input: {
                type: new GraphQLNonNull(inputType),
            },
        },
        async resolve(root, { input }, ctx, info) {
            if (ctx.__subscription) {
                return ctx.__subscription;
            }

            const publish = async data => {
                const result = await execute(
                    info.schema,
                    {
                        kind: 'Document',
                        definitions: [
                            info.operation,
                        ].concat(
                            Object.keys(info.fragments)
                                .map(key => info.fragments[key])
                        ),
                    },
                    root,
                    Object.assign({}, ctx, {
                        __subscription: data,
                    }),
                    info.variableValues
                );

                ctx.socket.emit(input.clientSubscriptionId, result);
            };

            const { data, result } = await start(publish, input, ctx, info);
            ctx.socket.on('disconnect', () => {
                stop(data, input, ctx, info);
            });

            return result;
        },
    };
};
