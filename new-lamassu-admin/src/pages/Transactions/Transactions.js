import { useQuery } from '@apollo/react-hooks'
import { makeStyles } from '@material-ui/core/styles'
import BigNumber from 'bignumber.js'
import gql from 'graphql-tag'
import moment from 'moment'
import * as R from 'ramda'
import React from 'react'

import LogsDowloaderPopover from 'src/components/LogsDownloaderPopper'
import Title from 'src/components/Title'
import DataTable from 'src/components/tables/DataTable'
import { ReactComponent as TxInIcon } from 'src/styling/icons/direction/cash-in.svg'
import { ReactComponent as TxOutIcon } from 'src/styling/icons/direction/cash-out.svg'
import { toUnit } from 'src/utils/coin'

import DetailsRow from './DetailsCard'
import { mainStyles } from './Transactions.styles'

const useStyles = makeStyles(mainStyles)

const GET_TRANSACTIONS = gql`
  {
    transactions {
      id
      txClass
      txHash
      toAddress
      commissionPercentage
      expired
      machineName
      operatorCompleted
      sendConfirmed
      dispense
      hasError: error
      deviceId
      fiat
      cashInFee
      fiatCode
      cryptoAtoms
      cryptoCode
      toAddress
      created
      customerName
      customerIdCardData
      customerIdCardPhotoPath
      customerFrontCameraPath
      customerPhone
    }
  }
`

const Transactions = () => {
  const classes = useStyles()

  const { data: txResponse } = useQuery(GET_TRANSACTIONS)

  const formatCustomerName = customer => {
    const { firstName, lastName } = customer

    return `${R.o(R.toUpper, R.head)(firstName)}. ${lastName}`
  }

  const getCustomerDisplayName = tx => {
    if (tx.customerName) return tx.customerName
    if (tx.customerIdCardData) return formatCustomerName(tx.customerIdCardData)
    return tx.customerPhone
  }

  const elements = [
    {
      header: '',
      width: 62,
      size: 'sm',
      view: it => (it.txClass === 'cashOut' ? <TxOutIcon /> : <TxInIcon />)
    },
    {
      header: 'Machine',
      name: 'machineName',
      width: 180,
      size: 'sm',
      view: R.path(['machineName'])
    },
    {
      header: 'Customer',
      width: 162,
      size: 'sm',
      view: getCustomerDisplayName
    },
    {
      header: 'Cash',
      width: 110,
      textAlign: 'right',
      size: 'sm',
      view: it => `${Number.parseFloat(it.fiat)} ${it.fiatCode}`
    },
    {
      header: 'Crypto',
      width: 141,
      textAlign: 'right',
      size: 'sm',
      view: it =>
        `${toUnit(new BigNumber(it.cryptoAtoms), it.cryptoCode).toFormat(5)} ${
          it.cryptoCode
        }`
    },
    {
      header: 'Address',
      view: R.path(['toAddress']),
      className: classes.overflowTd,
      size: 'sm',
      width: 136
    },
    {
      header: 'Date (UTC)',
      view: it => moment.utc(it.created).format('YYYY-MM-D'),
      textAlign: 'right',
      size: 'sm',
      width: 124
    },
    {
      header: 'Time (UTC)',
      view: it => moment.utc(it.created).format('HH:mm:ss'),
      textAlign: 'right',
      size: 'sm',
      width: 124
    }
  ]

  return (
    <>
      <div className={classes.titleWrapper}>
        <div className={classes.titleAndButtonsContainer}>
          <Title>Transactions</Title>
          {txResponse && (
            <div className={classes.buttonsWrapper}>
              <LogsDowloaderPopover
                title="Download logs"
                name="transactions"
                logs={txResponse.transactions}
                getTimestamp={tx => tx.created}
              />
            </div>
          )}
        </div>
        <div className={classes.headerLabels}>
          <div>
            <TxOutIcon />
            <span>Cash-out</span>
          </div>
          <div>
            <TxInIcon />
            <span>Cash-in</span>
          </div>
        </div>
      </div>
      <DataTable
        elements={elements}
        data={R.path(['transactions'])(txResponse)}
        Details={DetailsRow}
        expandable
      />
    </>
  )
}

export default Transactions
