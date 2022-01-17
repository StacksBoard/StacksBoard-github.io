import ReactGA from "react-ga4";
import React, { useEffect } from "react";
import { useParams } from 'react-router-dom';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Title from '../components/Title';
import processAllXactnWithTransfersApiPages from '../api/StxApi'
import convertJsonToStackingReportArray from '../bl/StackingBL'

export default function StackingReport(props) {

  const {walletInPath} = useParams();

  let walletId = props.walletId
  let setWalletId = props.setWalletId
  let stackData = props.stackData
  let setStackData = props.setStackData
  
  ReactGA.send({ hitType: "pageview", page: "/stacking" });

  const [coin, setCoin] = React.useState('');

  const handleCoinChange = (event) => {
      setCoin(event.target.value);
  };

  const handleWalletIdChange = (event) => {
      setWalletId(event.target.value)
  }

  async function handleGoClick() {
      if (coin === '') 
      {
          await setCoin('MIA')
      }

      console.log(walletId)

      if (walletId === '') {
        return;
      }

      if (walletId.length<5) // TODO: need a more robust check - perhaps against explorer API?
      {
          alert("Please enter a valid wallet address");
          return;
      }

      // TODO Activate spinner
      ReactGA.send({ hitType: "pageview", page: "/transactions" });

      let apiResults = await processAllXactnWithTransfersApiPages(walletId);
      let json=apiResults[1];
      let outputArray = await convertJsonToStackingReportArray(json,coin);
      setStackData(outputArray)
      console.log(json, outputArray)

  };

  useEffect(()=> {
    if (walletInPath !== undefined) {
      setWalletId(walletInPath)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletInPath])

  useEffect(()=> {
    if (stackData.length === 0){
      handleGoClick()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletId])

  return (
    <Container sx={{ mt: 4, mb: 4}}>
      <Grid container spacing={3}>

        {/* Wallet Input */}
        <Grid item xs={12} md={12} lg={12}>
          <Paper sx={{p: 2}}>

              <Grid container alignItems="center" spacing={2}> 
                <Grid item xs={10}>
                  <TextField
                    fullWidth
                    component="form"
                    autoComplete="on"
                    required
                    label="Wallet Address"
                    onChange={ handleWalletIdChange }
                    value={walletId}
                  />
                </Grid>

                <Grid item xs={1} >
                    <FormControl fullWidth>
                        <InputLabel id="coin-label">Coin</InputLabel>
                        <Select
                            labelId="coin-label"
                            id="coin-select"
                            value={coin}
                            label="Coin"
                            onChange={handleCoinChange}
                        >
                            <MenuItem value={'MIA'}>MIA</MenuItem>
                            <MenuItem value={'NYC'}>NYC</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={1}>
                  <Button 
                  fullWidth
                    sx={{ float: "right"}} 
                    variant="contained" 
                    onClick={ handleGoClick }
                  >
                    GO <PlayArrowIcon />
                  </Button>
                </Grid>
              </Grid>
          </Paper>
        </Grid>

        {/* Transactions*/}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Title>Stacking Report</Title>
          <Table size="small">

            <colgroup>
              <col style={{width:'5%'}}/>
              <col style={{width:'15%'}}/>
              <col style={{width:'15%'}}/>
              <col style={{width:'15%'}}/>
              <col style={{width:'15%'}}/>
              <col style={{width:'25%'}}/>
            </colgroup>

            <TableHead>
              <TableRow>
                <TableCell>Cycle</TableCell>
                <TableCell>Starting Block</TableCell>
                <TableCell>Ending Block</TableCell>
                <TableCell>Stacked Amount</TableCell>
                <TableCell>Claimed</TableCell>
                <TableCell>Claim Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stackData.map((row) => (
                <TableRow key={row.round}>
                  <TableCell>{row.round}</TableCell>
                  <TableCell>{row.startBlock}</TableCell>
                  <TableCell>{row.endBlock}</TableCell>
                  <TableCell>{row.stackedCoins}</TableCell>
                  <TableCell>{row.claimedRewards}</TableCell>
                  <TableCell>{row.endBlockDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}