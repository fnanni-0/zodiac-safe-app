import React, { useState } from "react";
import { ParamInput } from "../../../components/ethereum/ParamInput";
import { Interface, ParamType } from "@ethersproject/abi";
import { enableModule } from "services";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import CustomModuleImage from "../../../assets/images/custom-module-logo.png";
import { AddModuleModal } from "./AddModuleModal";
import { ActionButton } from "../../../components/ActionButton";
import { ReactComponent as AddIcon } from "../../../assets/icons/add-icon.svg";
import { makeStyles } from "@material-ui/core";
import { useRootDispatch } from "../../../store";
import { addTransaction } from "../../../store/transactionBuilder";
import { SafeAbi } from "../../../services/helpers";
import { serializeTransaction } from "../../../store/transactionBuilder/helpers";
import { ReactComponent as ArrowUpIcon } from "../../../assets/icons/arrow-up-icon.svg";

interface AddCustomModuleProps {
  open: boolean;

  onClose?(): void;

  onSubmit?(): void;
}

const useStyles = makeStyles((theme) => ({
  addButton: {
    marginTop: theme.spacing(2),
  },
  addTransactionButton: {
    marginTop: theme.spacing(1),
  },
  addIcon: {
    stroke: theme.palette.common.white,
    width: 20,
    height: 20,
  },
}));

export const CustomModuleModal = ({
  onSubmit,
  open,
  onClose,
}: AddCustomModuleProps) => {
  const { sdk, safe } = useSafeAppsSDK();
  const dispatch = useRootDispatch();
  const classes = useStyles();

  const [moduleAddress, setModuleAddress] = useState("");
  const [isAddressValid, setAddressValid] = useState(false);

  const handleAddressChange = (address: string, isValid: boolean) => {
    setModuleAddress(address);
    setAddressValid(!!address.length && isValid);
  };

  const resetState = () => {
    if (onClose) onClose();
    setModuleAddress("");
    setAddressValid(false);
  };

  const addModule = async () => {
    const tx = enableModule(safe.safeAddress, safe.chainId, moduleAddress);

    try {
      await sdk.txs.send({ txs: [tx] });
      resetState();
      if (onSubmit) onSubmit();
      if (onClose) onClose();
    } catch (error) {
      console.warn("error adding custom module", error);
    }
  };

  const addTransactionModule = () => {
    const inter = new Interface(SafeAbi);
    const func = inter.getFunction("enableModule");
    const tx = {
      func,
      to: safe.safeAddress,
      params: [moduleAddress],
      id: "add_module_" + new Date().getTime(),
    };

    dispatch(addTransaction(serializeTransaction(tx)));
    resetState();
    if (onClose) onClose();
  };

  return (
    <AddModuleModal
      hideButton
      open={open}
      onClose={onClose}
      title="Custom Module"
      image={<img src={CustomModuleImage} alt="Custom Module Logo" />}
      warning="Modules do not require multisig approval for transactions. Only add modules that you trust!"
    >
      <ParamInput
        placeholder="0xCcBFc37093009fd31f85F1Bf90c34F1e03FB351E"
        label="Module Address"
        param={ParamType.fromString("address")}
        onChange={handleAddressChange}
      />

      <ActionButton
        fullWidth
        disableElevation
        className={classes.addButton}
        variant="contained"
        disabled={!isAddressValid}
        startIcon={<ArrowUpIcon />}
        onClick={addModule}
      >
        Add Module
      </ActionButton>

      <ActionButton
        fullWidth
        className={classes.addTransactionButton}
        disabled={!isAddressValid}
        startIcon={<AddIcon />}
        onClick={addTransactionModule}
        variant="outlined"
      >
        Add to Transaction Bundle
      </ActionButton>
    </AddModuleModal>
  );
};
