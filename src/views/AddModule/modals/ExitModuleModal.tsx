import React, { useState } from "react";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { AddModuleModal } from "./AddModuleModal";
import ExitModuleImage from "../../../assets/images/exit-module-logo.png";
import { deployExitModule, ExitModuleParams } from "../../../services";
import { ParamInput } from "../../../components/ethereum/ParamInput";
import { ParamType } from "@ethersproject/abi";

interface ExitModuleModalProps {
  open: boolean;

  onClose?(): void;

  onSubmit?(): void;
}

type ExitModuleParamsInput = Omit<ExitModuleParams, "executor">;

const useStyles = makeStyles((theme) => ({
  fields: {
    marginBottom: theme.spacing(1),
  },
  loadMessage: {
    textAlign: "center",
  },
  textLink: {
    cursor: "pointer",
  },
}));

export const ExitModuleModal = ({
  open,
  onClose,
  onSubmit,
}: ExitModuleModalProps) => {
  const classes = useStyles();
  const { sdk, safe } = useSafeAppsSDK();

  const [errors, setErrors] = useState<
    Record<keyof ExitModuleParamsInput, boolean>
  >({
    tokenContract: false,
  });
  const [params, setParams] = useState<ExitModuleParamsInput>({
    tokenContract: "",
  });

  const isValid = Object.values(errors).every((field) => field);

  const onParamChange = <Field extends keyof ExitModuleParamsInput>(
    field: Field,
    value: ExitModuleParamsInput[Field],
    valid: boolean
  ) => {
    setErrors({ ...errors, [field]: valid });
    setParams({
      ...params,
      [field]: value,
    });
  };

  const handleAddExitModule = async () => {
    try {
      const txs = deployExitModule(safe.safeAddress, safe.chainId, {
        ...params,
        executor: safe.safeAddress,
      });

      await sdk.txs.send({ txs });
      if (onSubmit) onSubmit();
      if (onClose) onClose();
    } catch (error) {
      console.log("Error deploying module: ", error);
    }
  };

  return (
    <AddModuleModal
      open={open}
      onClose={onClose}
      title="Exit Module"
      description="This module allows any holders of a designated ERC20, at any time, to redeem their designated ERC20 tokens in exchange for a proportional share of the Safe’s ERC20 compatible assets."
      image={<img src={ExitModuleImage} alt="Custom Module Logo" />}
      tags={["From Gnosis Guild"]}
      onAdd={handleAddExitModule}
      readMoreLink="https://github.com/gnosis/zodiac-module-exit"
      ButtonProps={{ disabled: !isValid }}
    >
      <Typography gutterBottom>Parameters</Typography>

      <Grid container spacing={2} className={classes.fields}>
        <Grid item xs={12}>
          <ParamInput
            param={ParamType.from("address")}
            color="secondary"
            value={params.tokenContract}
            label="Token Contract Address"
            onChange={(value, valid) =>
              onParamChange("tokenContract", value, valid)
            }
          />
        </Grid>
      </Grid>
    </AddModuleModal>
  );
};
