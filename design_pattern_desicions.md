# Design Patterns

The two key design patterns implemented were restricting access and circuit breaker:
### 1.	Circuit Breaker: 
The Circuit Breaker Implementation ensures that the value of ether is accurately received for contributions. To prevent any mishandling of ether, any mismatch between the declared contribution of ether and the value of ether received in the transaction would change the state of emergencyAlert function from false to true. Resultantly,  this would cause both the ability to contribute to projects and add new projects to be suspended until the administrator had looked into the cause of the mismatch. This freezes the system to prevent further complications

***

### 2.	Restricting Access: 
In the contract, sensitive information such as the emergencyAlert variable and the add default project function was set to private. This was to ensure that sensitive information and the ability to create other default projects would not be possible due to the inability to call these functions outside of the contract.

***
### Rationale
The circuit breaker over the option of speed bumps as this was more suited for this crowdfunding application where it was vital to stop the important functions immediately when there was any mismatch in the value of ether contributed and freeze the contract until the issue has been resolved by the administrator. This would ensure that no subsequent attacks could be compounded.