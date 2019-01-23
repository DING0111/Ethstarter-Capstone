pragma solidity ^0.5.0;

contract Ethstarter {
    
    // initialise circuit breaker variable to be false. If variable is set to true, adding project and contributions functionality will revert as part of safety in designing this system
    bool private emergencyAlert = false;
    // Create Project struct with variables (add string url)
    struct Project {
        uint id;
        string title;
        string description;
        string url;
        uint target;
        uint currentValue;
    }
    
    modifier emergencyStop {
        if (emergencyAlert) {
            revert();
        }
        _;
    }
    // Implement Mapping to retrieve Project based on id
    mapping(uint => Project) public projects;
    
    // Initialise projectsCounter variable to track number of projects
    uint public projectsCounter;
    
    // Create event that takes in projectId for either creation of new project by user or contribution to project. This event will trigger the reloading of page to update content
    event newContributionNotification(uint indexed _projectId);
    event newProjectNotification(uint indexed _projectId);
    
    // Constructor which initialises 4 Default projects
    constructor() public payable {
        addDefaultProject("3D Printed Shoes", "Flexible and ergonomic footwear customized to your delight.", "https://images.pexels.com/photos/345415/pexels-photo-345415.jpeg?cs=srgb&dl=action-air-balance-345415.jpg&fm=jpg", 150000);
        addDefaultProject("Self-Heating Earl Grey Tea", "Just add cool water and the we'll settle the rest for you, delivering a warm cup of decadent earl grey milk tea.", "https://images.pexels.com/photos/229493/pexels-photo-229493.jpeg?cs=srgb&dl=bowl-caffeine-cooking-229493.jpg&fm=jpg", 200000);
        addDefaultProject("Solar Powered Scooters", "Green Eco-friendly Scooters to bring you just where you want", "https://images.pexels.com/photos/1731751/pexels-photo-1731751.jpeg?cs=srgb&dl=close-up-handlebar-scooter-1731751.jpg&fm=jpg", 100000);
        addDefaultProject("Autonomous Go Kart", "Powered by Deep Learning Algorithms, Racing on a new level", "https://images.pexels.com/photos/821723/pexels-photo-821723.jpeg?cs=srgb&dl=action-asphalt-black-background-821723.jpg&fm=jpg", 300000);
    }
    
    // Function for users to create new project
    function addProject(string memory _title, string memory _description, string memory _url, uint _target) emergencyStop public {
        // Increment number of projects by one
        projectsCounter += 1;
        // Create project and store it in the mapping of projectIds to project
        projects[projectsCounter] = Project(projectsCounter, _title, _description, _url, _target, 0);
        // Emit event to trigger reloading of page
        emit newProjectNotification(projectsCounter);         
    }

    // Fucntion for initialization of default projects
    function addDefaultProject(string memory _title, string memory _description, string memory _url, uint _target)  private {
        // Increment number of projects by one
        projectsCounter += 1;
        // Create Project and store it in the mapping o projectIds to project
        projects[projectsCounter] = Project(projectsCounter, _title, _description, _url, _target, 0);              
    }
    
    function contribute(uint _projectId, uint _contributionAmount) emergencyStop public payable {        
        // Check that user has sufficient balance in account (units in finney as solidity does not have floats)
        uint userBalance = msg.sender.balance / 1000000000000000;
        require(userBalance >= _contributionAmount);
        
        // Require that message value is equal to user's contribution account
        uint messageValue = msg.value /1000000000000000;
        if (messageValue != _contributionAmount) {
            emergencyAlert = true;
            revert();
        }
        // require(messageValue == _contributionAmount);  
        
        // Ensure projectId is valid
        require(_projectId > 0 && _projectId <= projectsCounter);
        
        // Check if user's contribution exceeds target
        uint projectCurrentValue = projects[_projectId].currentValue;
        uint projectTarget = projects[_projectId].target;
        if (projectCurrentValue + _contributionAmount > projectTarget) {
            uint excess = projectCurrentValue + _contributionAmount - projectTarget;
            msg.sender.transfer(excess * 1000000000000000);
            projects[_projectId].currentValue = projectTarget;
            
        } else {
            // add amount to project
            projects[_projectId].currentValue += _contributionAmount;
        }
        // Record event
        emit newContributionNotification(_projectId);
    }
}