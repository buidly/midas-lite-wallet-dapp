import { MouseEventHandler, useEffect } from 'react';
import uniq from 'lodash/uniq';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkIsValidSender } from 'helpers/sdkDapp/sdkDapp.helpers';
import {
  useGetAccount,
  useGetAccountFromApi,
  useGetLoginInfo,
  useReplyWithCancelled
} from 'hooks';
import { useAbortAndRemoveAllTxs } from 'hooks/useAbortAndRemoveAllTx';
import { hookSelector } from 'redux/selectors';
import { resetHook } from 'redux/slices';
import { routeNames } from 'routes';
import { LoginMethodsEnum } from 'types';
import { useValidateAndSignTxs } from './hooks';

export const Sign = () => {
  const { hookUrl } = useSelector(hookSelector);
  const { loginMethod } = useGetLoginInfo();
  const replyWithCancelled = useReplyWithCancelled({
    caller: 'Sign'
  });

  const { address } = useGetAccount();
  const removeAllTransactions = useAbortAndRemoveAllTxs();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { rawTxs, txErrors } = useValidateAndSignTxs();

  const hasErrors = Object.keys(txErrors).length > 0;

  const senderAddresses = uniq(
    rawTxs.map((tx) => tx.sender).filter((sender) => sender)
  );

  const sender = senderAddresses?.[0];

  // Skip account fetching if the sender is missing or same as current account
  const { data: senderAccount } = useGetAccountFromApi(
    !sender || sender === address ? null : sender
  );

  const validateHook = async () => {
    if (rawTxs.length === 0) {
      return;
    }

    // Extension has '/' as wallet origin and we need to navigate to dashboard
    // in case an error occurs in the hook validation

    const redirectPathname = routeNames.dashboard;

    const invalidHook = !hookUrl || hasErrors;

    const isValidSender = checkIsValidSender(senderAccount, [address]);

    if (invalidHook) {
      console.error('Invalid hook');
    }

    if (senderAddresses.length > 1) {
      console.error('Multiple senders are not allowed');
    }

    if (!isValidSender) {
      console.error(`Sender not allowed: ${sender}`);
    }

    if (invalidHook || senderAddresses.length > 1 || !isValidSender) {
      removeAllTransactions();
      dispatch(resetHook());
      navigate(redirectPathname);
    }
  };

  useEffect(() => {
    if (!hookUrl) {
      navigate(routeNames.dashboard);
      return;
    }

    validateHook();
  }, [rawTxs, senderAccount]);

  const handleClose: MouseEventHandler<HTMLElement> = (event) => {
    event.preventDefault();
    replyWithCancelled();
  };

  if (hasErrors) {
    // TODO: Add a modal container
    return (
      <div className='sign w-100 px-4 pb-4 d-flex align-items-center flex-column gap-4 justify-content-center'>
        <>
          {Object.entries(txErrors).map(([field, value], i) => (
            <div
              key={i}
              className='text-danger h4'
              data-testid={`${field}-error`}
            >
              {value}
            </div>
          ))}
        </>

        <button
          onClick={handleClose}
          className='btn btn-primary m-0 align-self-center w-auto px-4'
        >
          Close
        </button>
      </div>
    );
  }

  const noSpinner = [
    LoginMethodsEnum.extension,
    LoginMethodsEnum.walletconnectv2
  ].includes(loginMethod);

  if (noSpinner) {
    return null;
  }

  return null;
};
