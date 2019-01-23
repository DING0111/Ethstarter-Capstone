App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Check if web3 is already connected to current provider. If so, set web3 to current provider. Else, connect to local host 8545
    if (typeof web3 !== 'undefined') {      
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    // Create new instance of Ethstarter contract
    $.getJSON("Ethstarter.json", function(election) {
      App.contracts.Ethstarter = TruffleContract(election);
      // Set provider to web3Provider
      App.contracts.Ethstarter.setProvider(App.web3Provider);
      // Call function to listen out for evenets (new project or contribution)
      App.listenForEvents();  

      return App.render();
    });
  },

  listenForEvents: function() {
    // Deploy contract; Listen from current block to latest block
    App.contracts.Ethstarter.deployed().then(function(instance) {
      console.log('Watching for events');
      instance.newAugmentation({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Re-render upon new event
        App.render();
      });
    });
  },

  render: function() {
    // Instantiate Project Data; variable to hold instance of Ethstarter contract
    var projectData;

    // Empty all the previous values in the form
    $('#listProjects').val('');
    $('#titleInput').val('');
    $('#descriptionInput').val('');
    $('#targetInput').val('');
    $('#urlInput').val('');

    // Show loader and hide content
    var loader = $("#loader");
    var content = $("#content");
    loader.show();
    content.hide();

    // Get address of account through getCoinbase
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Deploy contract 
    App.contracts.Ethstarter.deployed().then(function(instance) {
      projectData = instance;
      return projectData.projectsCounter();
    }).then(function(projectsCount) {
      // Empty listProjects ID
      var projectLabel = $("#listProjects");
      projectLabel.empty();

      // Loop through each project 
      for (var i = 1; i <= projectsCount; i++) {
        projectData.projects(i).then(function(project) {
        // Retrieve category of each project
        var id = project[0];
        var title = project[1];
        var description = project[2];
        var urlName = project[3];
        var target = project[4] / 1000;
        var currentValue = project[5] / 1000;
        console.log("image " + id + " is " + urlName);

        // var testURL = 'url("https://images.pexels.com/photos/345415/pexels-photo-345415.jpeg?cs=srgb&dl=action-air-balance-345415.jpg&fm=jpg")'
        // Append each project html elements to projectLabel
        var projectsListing = '<div  style="width: 100%; min-height: 100vh; height: 100vh; background-position: center; background-repeat: no-repeat; background-size: cover; background-image: url(\' '+ urlName + ' \')";><h1 style="text-align: center; padding-top: 40%; "><div style="border: 2px solid black; padding: 20px 40px 20px 40px; background-color: rgba(255,255,255,0.8); width: 40%; margin:auto;">' + title + '</div></h1></div><div style="width: 100%; min-height: 40vh; height: 40vh; background-color: white; padding-top: 80px; padding-left: 70px;";><h1 style="text-transform: uppercase; font-weight: 900;">' + title + '</h1><h2 style="width: 50%; font-size: 20px; font-weight: lighter;">' + description+ '</h2><h2>' + currentValue + '/'  + target + '</h2><h2>target</h2><form onSubmit="App.contributeToProject(); return false;"><input required step=".01" id=' + id + 'input' + ' name="voteNumber" type="number"><button id=' + id + ' class="btn btn-primary">Vote Now</button></form></div>'
        projectLabel.append(projectsListing);
        });
      }

      // Hide loader and Display new Content to be renderred
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  // Function to create new project from form entry 
  createProject: function() {
    // Retrieve the individual values of form field into variables; Note that targetInput is multiplied by 1000 to convert ether to finney (solidity code takes in finney due to lack of float data type)
    var titleInput = $('#titleInput').val();
    var descriptionInput = $('#descriptionInput').val();
    var targetInput = $('#targetInput').val();
    targetInput *= 1000;
    var urlInput = $('#urlInput').val();
    console.log(urlInput);
    
    // Deploy contract
    App.contracts.Ethstarter.deployed().then(function(instance) {
      // Call addProject function
      return instance.addProject(titleInput, descriptionInput, urlInput, targetInput);
    }).then(function(result) {
      // Hide content while transaction is being processed
      $("#content").hide();
      $("#loader").show();      
    }).catch(function(err) {
      console.error(err);
    });
  },

  // Function to contribute to project
  contributeToProject: function() {   
    // Selector to get id of active element to determine which project the user wants to contribute to
    var projectId = $(document.activeElement).attr('id');
    console.log(projectId);
    // Retrieve value of contribution from input field
    var inputId = projectId + 'input';
    console.log(inputId);
    var contributionAmount = $('#' + inputId).val();
    console.log(contributionAmount);
    contributionAmount *= 1000;
    console.log(contributionAmount);

    // Deploy Contract
    App.contracts.Ethstarter.deployed().then(function(instance) {
      // Call Contribute function
      return instance.contribute(projectId, contributionAmount, { value: web3.toWei(contributionAmount / 1000, 'ether') });
    }).then(function(result) {
      // Hide content whilst transaction is ongoing
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});