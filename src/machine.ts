import {assign, setup} from "xstate";

export const machine = setup({
    types: {
        context: {} as { balance: number; },
        events: {} as
            | { type: "dispense" }
            | { type: "putInMoney" }
            | { type: "changeEjected" }
            | { type: "pushRefundButton" }
            | { type: "pushSelectionButton" },
    },
    actions: {
        incrementMoney: assign({balance: ({context}) => context.balance+0.25}),
        resetBalance: assign({balance: () => 0}),
        chargeBalance: assign({balance: ({context}) => context.balance -.75}),
    },
    guards: {
        ifSufficientMoney: function ({ context }) {
            return context.balance >= .75
        },
        hasBalance: function ({ context }) {
            return context.balance > 0
        },
    },
    schemas: {
        events: {
            dispense: {
                type: "object",
                properties: {},
            },
            putInMoney: {
                type: "object",
                properties: {},
            },
            changeEjected: {
                type: "object",
                properties: {},
            },
            pushRefundButton: {
                type: "object",
                properties: {},
            },
            pushSelectionButton: {
                type: "object",
                properties: {},
            },
        },
        context: {
            balance: {
                type: "number",
                description: "How much money is from the user?",
            },
            changeBalance: {
                type: "number",
                description: "how much is available for change",
            },
        },
    },
}).createMachine({
    context: {
        balance: 0,
    },
    id: "Vending Machine with parallel coin return",
    initial: "IdleWithNoMoney",
    states: {
        IdleWithNoMoney: {
            on: {
                putInMoney: {
                    target: "AddMoney",
                },
                pushSelectionButton: {
                    target: "DisplaySelectionPrice",
                },
                pushRefundButton: {
                    target: "DisplayNoMoneyError",
                },
            },
        },
        AddMoney: {
            always: {
                target: "IdleWithMoney",
            },
            entry: {
                type: "incrementMoney",
            },
        },
        DisplaySelectionPrice: {
            tags: ['displayMessage'],
            after: {
                "3000": {
                    target: "IdleWithNoMoney",
                },
            },
        },
        DisplayNoMoneyError: {
            tags: ['displayMessage'],
            after: {
                "3000": {
                    target: "IdleWithNoMoney",
                },
            },
        },
        IdleWithMoney: {
            on: {
                pushRefundButton: {
                    target: "Eject_Change",
                },
                putInMoney: {
                    target: "AddMoney",
                },
                pushSelectionButton: [
                    {
                        target: "DispenseSelectedItem",
                        guard: {
                            type: "ifSufficientMoney",
                        },
                    },
                    {
                        target: "DisplayInsufficientMoneyError",
                    },
                ],
            },
        },
        Eject_Change: {
            tags: ['displayMessage'],
            on: {
                changeEjected: {
                    target: "IdleWithNoMoney",
                },
            },
            entry: {
                type: "resetBalance",
            },
        },
        DispenseSelectedItem: {
            tags: ['displayMessage'],
            on: {
                dispense: {
                    target: "ItemDispensed",
                },
            },
            entry: {
                type: "chargeBalance",
            },
        },
        DisplayInsufficientMoneyError: {
            tags: ['displayMessage'],
            after: {
                "3000": {
                    target: "IdleWithMoney",
                },
            },
        },
        ItemDispensed: {
            tags: ['displayMessage'],
            always: [
                {
                    target: "IdleWithMoney",
                    guard: {
                        type: "hasBalance",
                    },
                },
                {
                    target: "IdleWithNoMoney",
                },
            ],

        },
    },
});
