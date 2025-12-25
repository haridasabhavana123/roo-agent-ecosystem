```mermaid
flowchart LR
    Customer["Customer / Party"]
    Channels["Digital Channels"]
    CustomerMgmt["Customer Management Service Domain"]
    CoreBanking["Core Banking Systems"]
    CRM["CRM & Analytics Systems"]
    Regulatory["Regulatory / KYC Systems"]

    Customer --> Channels
    Channels -->|Profile & Relationship Management| CustomerMgmt
    CustomerMgmt -->|Customer reference data| CoreBanking
    CustomerMgmt -->|Insights & segmentation| CRM
    CustomerMgmt -->|KYC / compliance data| Regulatory