pragma solidity ^0.5.0;

contract Ethstarter {
    // Create Project struct with variables (add string url)
    struct Project {
        uint id;
        string title;
        string description;
        uint target;
        uint currentValue;
    }
    
    // Implement Mapping to retrieve Project based on id
    mapping(uint => Project) public projects;
    
    // Initialise projectsCounter variable to track number of projects
    uint public projectsCounter;
    
    // Create event that takes in projectId for either creation of new project by user or contribution to project. This event will trigger the reloading of page to update content
    event newAugmentation(uint indexed _projectId);
    
    // Constructor which initialises 6 Default projects
    constructor() public payable {
        addDefaultProject("3D Printed Shoes", "Powered by SLA Technology, these customised 3D Printed shoes are flexible, comfortable and ergonomic.", 150000);
        addDefaultProject("Self-Heating Earl Grey Tea", "Just add cool water and the we'll settle the rest for you, delivering a warm cup of decadent earl grey milk tea.", 200000);
        addDefaultProject("Solar Powered Scooters", "Green Eco-friendly Scooters to bring you just where you want", 100000);
    }
    
    // Function for users to create new project
    function addProject(string memory _title, string memory _description, uint _target) public {
        // Increment number of projects by one
        projectsCounter += 1;
        // Create project and store it in the mapping of projectIds to project
        projects[projectsCounter] = Project(projectsCounter, _title, _description, _target, 0);
        // Emit event to trigger reloading of page
        emit newAugmentation(projectsCounter);         
    }

    // Fucntion for initialization of default projects
    function addDefaultProject(string memory _title, string memory _description, uint _target) public {
        // Increment number of projects by one
        projectsCounter += 1;
        // Create Project and store it in the mapping o projectIds to project
        projects[projectsCounter] = Project(projectsCounter, _title, _description, _target, 0);              
    }
    
    function contribute(uint _projectId, uint _contributionAmount) public payable {        
        // Check that user has sufficient balance in account (units in finney as solidity does not have floats)
        uint userBalance = msg.sender.balance / 1000000000000000;
        require(userBalance >= _contributionAmount);
        
        // Require that message value is equal to user's contribution account
        uint messageValue = msg.value /1000000000000000;
        require(messageValue == _contributionAmount);  
        
        // Ensure projectId is valid
        require(_projectId > 0 && _projectId <= projectsCounter);
        
        // Check if user's contribution exceeds target
        uint projectCurrentValue = projects[_projectId].currentValue;
        uint projectTarget = projects[_projectId].target;
        if (projectCurrentValue + _contributionAmount > projectTarget) {
            uint excess = projectCurrentValue + _contributionAmount - projectTarget;
            msg.sender.transfer(excess);
            projects[_projectId].currentValue = projectTarget;
            
        } else {
            // add amount to project
            projects[_projectId].currentValue += _contributionAmount;
        }
        
        
        
        
        // Record event
        emit newAugmentation(_projectId);
    }
}