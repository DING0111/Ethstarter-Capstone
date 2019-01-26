# Avoiding Common Attacks
### Integer Overflow
For this application, the key threat identified that posed a risk to the security of the application was Integer Overflow. Should the accuracy of the calculations be jeopardised due to integer overflow, that would affect the records of the individual projects. This would affect the trust in this dApp. In the context of crowdfunding, the climate of trust is essential and a key element to building that community that supports each other.

### Mitigation 
To overcome this vulnerability, Ethstarter employed the use of SafeMath library. The code is obtained from OpenZeppelin. The implementation and integration of the library SafeMath is key to enabling error-free arithmetic operations to avoid the complications and errors of integer overflow. 
