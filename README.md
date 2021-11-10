# treasury - hardhat

1. Install package 
    ```
    yarn
    ``` 
    
2. Create .env file from .env.example
3. Compile
    ```
    yarn hardhat compile
    ```
4. Deploy + verify:
    ```
    yarn hardhat deploy --reset --tags deploy-verify  --network bsctestnet
    ```