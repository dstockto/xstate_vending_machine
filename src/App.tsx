import './App.css'
import {useMachine} from "@xstate/react";
import {machine} from "./machine.ts";

function App() {
    const [state, send] = useMachine(machine);

    const formatMoney = (money: number) => {
        return '$' + money.toFixed(2);
    }
    const junkFoodCost = 0.75;

    return (
        <div className={"vending_machine"}>
            <div className={"digital_display"}>
                {!state.hasTag('displayMessage') && <div>{formatMoney(state.context.balance)}</div>}
                {state.matches('DisplayNoMoneyError') &&
                    <div>No Money</div>
                }
                {state.matches('Eject_Change') &&
                    <div>Take Change</div>
                }
                {state.matches('DisplayInsufficientMoneyError') &&
                    <div>Insert {formatMoney(junkFoodCost - state.context.balance)}</div>
                }
                {
                    state.matches('DisplaySelectionPrice') &&
                    <div>Junk food is {formatMoney(junkFoodCost)}</div>
                }
                {
                    state.matches('DispenseSelectedItem') &&
                    <div>Plz Remove Item</div>
                }
            </div>
            <div className={"bottle_display"}></div>
            <div className={"coin_slot"} onClick={() => send({type: "putInMoney"})}></div>
            <div className={"selection_button"} onClick={() => send({type: "pushSelectionButton"})}>Junk Food</div>
            <div className={"refund_button"} onClick={() => send({type: "pushRefundButton"})}></div>
            <div className={"change_receptacle"}>
                {state.matches('Eject_Change') &&
                    <div className={"change"} onClick={() => send({type: "changeEjected"})}></div>
                }
            </div>
            <div className={"dispenser"}>
                {state.matches('DispenseSelectedItem') &&
                    <div className={"junk_food"} onClick={() => send({type: "dispense"})}>JunkFOOD</div>
                }
                <div className={"dispenser_catch"}></div>
            </div>
        </div>
    );
}

export default App
