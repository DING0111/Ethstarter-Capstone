var Ethstarter = artifacts.require("./Ethstarter.sol");

contract("Ethstarter", function(accounts){
    // initialise variable projectData to store instance of depoyed Ethstarter contract
    var projectData;

    // ensure that 4 default projects are created
    it("check for initialization with 4 default projects", function(){
        return Ethstarter.deployed().then(function(instance){
            return instance.projectsCounter();
        }).then(function(numberOfProjects){
            assert.equal(numberOfProjects, 4);
        });
    });

    // ensure the values of the 4 default projects are accurate
    it("ensure that all 4 default values are accurately initalized", function(){
        return Ethstarter.deployed().then(function(instance){
            projectData = instance;
            return projectData.projects(1);
        }).then(function(project){
            assert.equal(project[0], 1, "Accurate id value");
            assert.equal(project[1], "3D Printed Shoes", "Accurate title value");
            assert.equal(project[2], "Flexible and ergonomic footwear customized to your delight.", "Accurate description value");
            assert.equal(project[3], "https://images.pexels.com/photos/345415/pexels-photo-345415.jpeg?cs=srgb&dl=action-air-balance-345415.jpg&fm=jpg", "Accurate image url value");
            assert.equal(project[4], 150000, "Accurate target value");
            assert.equal(project[5], 0, "Accurate ethereum value");
            return projectData.projects(2);
        }).then(function(project){
            assert.equal(project[0], 2, "Accurate id value");
            assert.equal(project[1], "Self-Heating Earl Grey Tea", "Accurate title value");
            assert.equal(project[2],"Just add cool water and the we'll settle the rest for you, delivering a warm cup of decadent earl grey milk tea.", "Accurate description value");
            assert.equal(project[3],"https://images.pexels.com/photos/229493/pexels-photo-229493.jpeg?cs=srgb&dl=bowl-caffeine-cooking-229493.jpg&fm=jpg", "Accurate image url value");
            assert.equal(project[4], 200000, "Accurate target value");
            assert.equal(project[5], 0, "Accurate ethereum value");
            return projectData.projects(3);            
        }).then(function(project){
            assert.equal(project[0], 3, "Accurate id value");
            assert.equal(project[1], "Solar Powered Scooters", "Accurate title value");
            assert.equal(project[2],"Green Eco-friendly Scooters to bring you just where you want", "Accurate description value");
            assert.equal(project[3],"https://images.pexels.com/photos/1731751/pexels-photo-1731751.jpeg?cs=srgb&dl=close-up-handlebar-scooter-1731751.jpg&fm=jpg", "Accurate image url value");
            assert.equal(project[4], 100000, "Accurate target value");
            assert.equal(project[5], 0, "Accurate ethereum value");
            return projectData.projects(4);   
        }).then(function(project){
            assert.equal(project[0], 4, "Accurate id value");
            assert.equal(project[1], "Autonomous Go Kart", "Accurate title value");
            assert.equal(project[2],"Powered by Deep Learning Algorithms, Racing on a new level");
            assert.equal(project[3],"https://images.pexels.com/photos/821723/pexels-photo-821723.jpeg?cs=srgb&dl=action-asphalt-black-background-821723.jpg&fm=jpg", "Accurate image url value");
            assert.equal(project[4], 300000, "Accurate target value");
            assert.equal(project[5], 0, "Accurate ethereum value");
        })
    })

    // test event is correctly emitted when new project is initiated by users
    it("ensure event is emitted when new project is inititaed to trigger reloading of page", function(){
        return Ethstarter.deployed().then(function(instance){
            projectData = instance;
            return projectData.addProject("Virtual Reality Roller Coasters", "Life thrills on a roller coaster with your safety assured", "https://images.pexels.com/photos/106155/germany-duisburg-tiger-turtle-106155.jpeg?cs=srgb&dl=architecture-engineering-entertainment-106155.jpg&fm=jpg", 200000);
        }).then(function(receipt){
            assert.equal(receipt.logs[0].event, "newAugmentation", "correct event is emmitted");
        });
    });

    // test entries are accurate when users create new projects
    it("ensure that new project created by users are accurately recorded.", function(){
        return Ethstarter.deployed().then(function(instance){
            projectData = instance;
            return projectData.addProject("Chocalate Cheese Fondue Fountain", "Bringing together the best of sweet and savoury together", "https://images.pexels.com/photos/219162/pexels-photo-219162.jpeg?cs=srgb&dl=bread-chocolate-delicious-219162.jpg&fm=jpg", 400000);
        }).then(function(receipt){            
            return projectData.projects(6);
        }).then(function(project){
            assert.equal(project[0], 6, "Accurate id value");
            assert.equal(project[1], "Chocalate Cheese Fondue Fountain");
            assert.equal(project[2],"Bringing together the best of sweet and savoury together");
            assert.equal(project[3],"https://images.pexels.com/photos/219162/pexels-photo-219162.jpeg?cs=srgb&dl=bread-chocolate-delicious-219162.jpg&fm=jpg", "Accurate image url value");
            assert.equal(project[4], 400000, "Accurate target value");
            assert.equal(project[5], 0, "Accurate ethereum value");            
        })
    })

    // test correct amount is contributed by user to the specified project
    it("ensure that value indicated by user is contributed to the right project", function(){
        return Ethstarter.deployed().then(function(instance){
            projectData = instance;
            projectId = 2;
            return projectData.contribute(projectId, 6000, {value: 6000000000000000000 });
        }).then(function(receipt){
            return projectData.projects(projectId);
        }).then(function(project){
            assert.equal(project[5], 6000, "accurate amount contributed");
        });
    })
})