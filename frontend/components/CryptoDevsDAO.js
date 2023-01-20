import { ethers, providers, utils } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import {
  contractAddresses,
  abi,
  nftabi,
  nftcontractAddresses,
} from "../constants/index";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function CryptoDevsDAO() {
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState("0");
  const [numProposals, setNumProposals] = useState("0");
  const [proposals, setProposals] = useState([]);
  const [nftBalance, setNftBalance] = useState("0");
  const [fakeNftTokenId, setFakeNftTokenId] = useState("");
  const [selectedTab, setSelectedTab] = useState("");

  const web3ModalRef = useRef();

  async function getSigner() {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner();

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Please switch to the Goerli network!");
      throw new Error("Please switch to the Goerli network");
    }

    return signer;
  }

  async function connectWallet() {
    try {
      const signer = await getSigner();
      setWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  }

  async function cryptoDevsDAOInstance() {
    const signer = await getSigner();
    const cryptoDevsDao = new ethers.Contract(
      contractAddresses[5][0],
      abi,
      signer
    );
    return cryptoDevsDao;
  }

  async function cryptoDevsNFTInstance() {
    const signer = await getSigner();
    const cryptoDevsNft = new ethers.Contract(
      nftcontractAddresses[5][0],
      nftabi,
      signer
    );
    return cryptoDevsNft;
  }

  async function getDAOOwner() {
    try {
      const signer = await getSigner();
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const address = await signer.getAddress();
      const _owner = await cryptoDevsDao.owner();

      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.log(err.message);
    }
  }

  async function withdrawDAOEther() {
    try {
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const tx = await cryptoDevsDao.withdrawEther();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      setTreasuryBalance("0");
    } catch (err) {
      console.log(err);
      window.alert(err.reason);
    }
  }

  async function getDAOTreasuryBalance() {
    try {
      const signer = await getSigner();
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const _balance = await signer.getBalance(cryptoDevsDao);
      setTreasuryBalance(_balance.toString());
    } catch (err) {
      console.log(err);
    }
  }

  async function getNumProposalsInDao() {
    try {
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const _numProposals = await cryptoDevsDao.numProposals();
      setNumProposals(_numProposals.toString());
    } catch (err) {
      console.log(err);
    }
  }

  async function getUserNFTBalance() {
    try {
      const signer = await getSigner();
      const cryptoDevsNft = await cryptoDevsNFTInstance();
      const _nftBalance = await cryptoDevsNft.balanceOf(signer.getAddress());
      setNftBalance(parseInt(_nftBalance.toString()));
    } catch (err) {
      console.log(err);
    }
  }

  async function createProposal() {
    try {
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const tx = await cryptoDevsDao.createProposal(fakeNftTokenId);
      setLoading(true);
      await tx.wait();
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchProposalById(id) {
    try {
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const _proposal = await cryptoDevsDao.proposals(id);
      const parsedProposal = {
        proposalId: id,
        nftTokenId: _proposal.nftTokenId.toString(),
        deadline: new Date(parseInt(_proposal.deadline.toString()) * 1000),
        yayVotes: _proposal.yayVotes.toString(),
        nayVotes: _proposal.nayVotes.toString(),
        executed: _proposal.executed,
      };
      return parsedProposal;
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchAllProposals() {
    try {
      const _proposals = [];
      for (let i = 0; i < numProposals; i++) {
        const _proposal = await fetchProposalById(i);
        _proposals.push(_proposal);
      }
      setProposals(_proposals);
      return _proposals;
    } catch (err) {
      console.log(err);
    }
  }

  async function voteOnProposal(proposalId, _vote) {
    try {
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const vote = _vote === "YAY" ? 0 : 1;
      const txn = await cryptoDevsDao.voteOnProposal(proposalId, vote);
      setLoading(true);
      await txn.wait();
      setLoading(false);
      await fetchAllProposals();
    } catch (err) {
      console.log(err);
      window.alert(err.reason);
    }
  }

  const executeProposal = async (proposalId) => {
    try {
      const cryptoDevsDao = await cryptoDevsDAOInstance();
      const tx = await cryptoDevsDao.executeProposal(proposalId);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await fetchAllProposals();
      getDAOTreasuryBalance();
    } catch (error) {
      console.error(error);
      window.alert(error.reason);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet().then(() => {
        getDAOTreasuryBalance();
        getUserNFTBalance();
        getNumProposalsInDao();
        getDAOOwner();
      });
    }
  }, [walletConnected]);

  useEffect(() => {
    if (selectedTab === "View Proposals") {
      fetchAllProposals();
    }
  }, [selectedTab]);

  // Render the contents of the appropriate tab based on `selectedTab`
  function renderTabs() {
    if (selectedTab === "Create Proposal") {
      return renderCreateProposalTab();
    } else if (selectedTab === "View Proposals") {
      return renderViewProposalsTab();
    }
    return null;
  }

  // Renders the 'Create Proposal' tab content
  function renderCreateProposalTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (nftBalance === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    } else {
      return (
        <div className={styles.container}>
          <label>Fake NFT Token ID to Purchase: </label>
          <input
            placeholder="0"
            type="number"
            onChange={(e) => setFakeNftTokenId(e.target.value)}
          />
          <button className={styles.button2} onClick={createProposal}>
            Create
          </button>
        </div>
      );
    }
  }

  // Renders the 'View Proposals' tab content
  function renderViewProposalsTab() {
    if (loading) {
      return (
        <div className={styles.description}>
          Loading... Waiting for transaction...
        </div>
      );
    } else if (proposals.length === 0) {
      return (
        <div className={styles.description}>No proposals have been created</div>
      );
    } else {
      return (
        <div>
          {proposals.map((p, index) => (
            <div key={index} className={styles.proposalCard}>
              <p>Proposal ID: {p.proposalId}</p>
              <p>Fake NFT to Purchase: {p.nftTokenId}</p>
              <p>Deadline: {p.deadline.toLocaleString()}</p>
              <p>Yay Votes: {p.yayVotes}</p>
              <p>Nay Votes: {p.nayVotes}</p>
              <p>Executed?: {p.executed.toString()}</p>
              {p.deadline.getTime() > Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "YAY")}
                  >
                    Vote YAY
                  </button>
                  <button
                    className={styles.button2}
                    onClick={() => voteOnProposal(p.proposalId, "NAY")}
                  >
                    Vote NAY
                  </button>
                </div>
              ) : p.deadline.getTime() < Date.now() && !p.executed ? (
                <div className={styles.flex}>
                  <button
                    className={styles.button2}
                    onClick={() => executeProposal(p.proposalId)}
                  >
                    Execute Proposal{" "}
                    {p.yayVotes > p.nayVotes ? "(YAY)" : "(NAY)"}
                  </button>
                </div>
              ) : (
                <div className={styles.description}>Proposal Executed</div>
              )}
            </div>
          ))}
        </div>
      );
    }
  }

  return (
    <div>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {nftBalance}
            <br />
            Treasury Balance: {ethers.utils.formatEther(treasuryBalance)} ETH
            <br />
            Total Number of Proposals: {numProposals}
          </div>
          <div className={styles.flex}>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("Create Proposal")}
            >
              Create Proposal
            </button>
            <button
              className={styles.button}
              onClick={() => setSelectedTab("View Proposals")}
            >
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {/* Display additional withdraw button if connected wallet is owner */}
          {isOwner ? (
            <div>
              {loading ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <button className={styles.button} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          ) : (
            ""
          )}
        </div>
        <div>
          <img className={styles.image} src="/cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; Tarang Tyagi</footer>
    </div>
  );
}
