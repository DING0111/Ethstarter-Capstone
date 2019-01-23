var state = false,

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  

  init: function() {
    state = false;
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
      instance.newContributionNotification({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Re-render upon new event
        if (state== true){
          App.render();
        }
        state = false;
      });
      instance.newProjectNotification({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Re-render upon new event
        if (state== true){
          App.render();
        }
        state = false;
      });
    });
  },

  render: function() {
    // Instantiate Project Data; variable to hold instance of Ethstarter contract
    var projectData;
    state = false;
    

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
        var percentageCompletion = currentValue / target * 100;
        percentageCompletion = percentageCompletion + '%';

        // var testURL = 'url("https://images.pexels.com/photos/345415/pexels-photo-345415.jpeg?cs=srgb&dl=action-air-balance-345415.jpg&fm=jpg")'
        // Append each project html elements to projectLabel
        var projectsListing = '<div  style="width: 100%; min-height: 100vh; height: 100vh; background-position: center; background-repeat: no-repeat; background-size: cover; background-image: url(\' '+ urlName + ' \')";></div><div class="row" style="width: 100%; min-height: 40vh; height: 40vh; background-color: white; padding-top: 60px; padding-left: 70px; padding-bottom: 40px;"><div class="col-sm-8"><h1 style="text-transform: uppercase; font-weight: 800; font-size: 50px;">' + title + '</h1><h2 style="width: 95%; font-size: 33px; font-family: Raleway-Thin;">' + description+ '</h2></div><div class="col-sm-4"><div style="width: 180px"><div id="progressbar" style="background-color: white;border-radius: 13px; padding: 0px;border: 2px solid purple;"><div style="background-color: purple;width:' + percentageCompletion + ';height: 20px;border-radius: 10px;"></div></div><h2 style="font-family: Raleway-Thin; color: purple;">' + currentValue + '/'  + target + '</h2><form onSubmit="App.contributeToProject(); return false;"><input style="margin-top: 15px;" required step=".01" id=' + id + 'input' + ' name="voteNumber" type="number" placeholder="Amount in Ether" class="form-control"><button id=' + id + ' style="margin-top: 3px;" class="btn btn-block btn-danger">Contribute</button></form></div></div></div>'
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
    state = true;
    var titleInput = $('#titleInput').val();
    var descriptionInput = $('#descriptionInput').val();
    var targetInput = $('#targetInput').val();
    targetInput *= 1000;
    var urlInput = $('#urlInput').val();
    console.log(urlInput);

    function imageExists(url, callback) {
      var img = new Image();
      img.onload = function() { callback(true); };
      img.onerror = function() { callback(false); };
      img.src = url;
    }
  
    
    function validateImageURL(url)
      {
          
        var imageUrl = url;
        
        imageExists(imageUrl, function(exists) {
          //Show the result
          if (!exists){
            alert('Image URL is not valid. Refer to instructions above input field to enter valid image');
            return;
          }
          
        });
        
      }
    
    validateImageURL(urlInput);

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
    state = true;
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