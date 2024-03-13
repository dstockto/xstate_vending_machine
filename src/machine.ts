import {assign, setup} from "xstate";

export const machine = setup({
    types: {
        context: {} as { balance: number; },
        events: {} as
            | { type: "putInMoney" }
            | { type: "pushRefundButton" }
            | { type: "pushSelectionButton" }
            | { type: "takeCoins" }
            | { type: "takeItem" },
    },
    actions: {
        incrementMoney: assign({balance: ({context}) => context.balance+0.25}),
        resetBalance: assign({balance: () => 0}),
        chargeBalance: assign({balance: ({context}) => context.balance -.75}),
    },
    actors: {
    },
    guards: {
        ifSufficientMoney: function ({ context }) {
            return context.balance >= .75
        },
        hasBalance: function ({ context }) {
            return context.balance > 0
        },
        noBalance: function ({context}) {
            return context.balance === 0
        }
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
    type: "parallel",
    states: {
        VendingMachine: {
            initial: "Idle",
            states: {
                Idle: {
                    tags: "Idle",
                    on: {
                        putInMoney: {
                            target: "AddMoney",
                        },
                        pushSelectionButton: [
                            {
                                target: "DisplaySelectionPrice",
                                guard: {
                                    type: "noBalance"
                                }
                            },
                            {
                                target: "DispenseSelectedItem",
                                guard: {
                                    type: "ifSufficientMoney",
                                },
                            },
                            {
                                target: "DisplayInsufficientMoneyError"
                            }
                        ],
                        pushRefundButton: [
                            {
                                target: "DisplayNoMoneyError",
                                guard: {
                                    type: "noBalance",
                                }
                            },
                            {
                                target: "Eject_Change"
                            }
                        ]
                    }
                },
                AddMoney: {
                    always: {
                        target: "Idle",
                    },
                    entry: {
                        type: "incrementMoney",
                    },
                },
                DisplaySelectionPrice: {
                    tags: ['displayMessage', 'DisplaySelectionPrice'],
                    on: {
                        putInMoney: {
                            target: "AddMoney",
                        },
                    },
                    after: {
                        "3000": {
                            target: "Idle",
                        },
                    },
                },
                DisplayNoMoneyError: {
                    tags: ['displayMessage', 'DisplayNoMoneyError'],
                    on: {
                        putInMoney: {
                            target: "AddMoney",
                        },
                    },
                    after: {
                        "3000": {
                            target: "Idle",
                        },
                    },
                },
                Eject_Change: {
                    tags: ['displayMessage', 'Eject_Change'],
                    after: {
                        "3000": "Idle",
                    },
                    entry: {
                        type: "resetBalance",
                    },
                },
                DispenseSelectedItem: {
                    tags: ['displayMessage', 'DispenseSelectedItem'],
                    after: {
                        "3000": "Idle",
                    },
                    on: {
                        putInMoney: {
                            target: "AddMoney",
                        },
                    },
                    entry: [{
                        type: "chargeBalance",
                    }],
                },
                DisplayInsufficientMoneyError: {
                    tags: ['displayMessage', 'DisplayInsufficientMoneyError'],
                    on: {
                        putInMoney: {
                            target: "AddMoney",
                        },
                    },
                    after: {
                        "3000": {
                            target: "Idle",
                        },
                    },
                },
            }
        },
        CoinReturn: {
            initial: "EMPTY",
            states: {
                EMPTY: {
                    on: {
                        pushRefundButton: {
                            guard: {
                                type: "hasBalance",
                            },
                            target: "HAS_COINS",
                        }
                    }
                },
                HAS_COINS: {
                    tags: ['hasCoins'],
                    on: {
                        takeCoins: {
                            target: "EMPTY",
                        }
                    }
                },
            }
        },
        ItemSlot: {
            initial: "EMPTY",
            states: {
                EMPTY: {
                    on: {
                        pushSelectionButton: {
                            target: "HAS_ITEMS",
                            guard: {
                                type: "ifSufficientMoney",
                            },
                        },
                    },
                },
                HAS_ITEMS: {
                    tags: ['hasItems'],
                    on: {
                        takeItem: {
                            target: "EMPTY",
                        }
                    }
                },
            }
        },
    },
});
