# Oracle Cloud Infrastructure Discovery

This guide walks you through setting up and configuring the Oracle Cloud Infrastructure (OCI) CLI for infrastructure discovery and management.

---

## 📋 Table of Contents

- [Web Console Access](#web-console-access)
- [OCI CLI Installation](#oci-cli-installation)
- [OCI CLI Configuration](#oci-cli-configuration)
- [Verification](#verification)

---

## Web Console Access

### Oracle Cloud Sign-In

Access the Oracle Cloud web console at: <https://www.oracle.com/latam/cloud/sign-in.html>

**Account Details:**

```text
Cloud Account Name: agustincarranza
Identity Domain: OracleIdentityCloud
Region: us-ashburn-1
User: agustincarranza@mi.unc.edu.ar
Password: *********
```

---

## OCI CLI Installation

### Verify Existing Installation

Check if OCI CLI is already installed and working:

```bash
oci iam region list
```

### Install OCI CLI (If Needed)

If the CLI is not working or not installed, use the official installation script:

**Installation Script:**

```bash
bash -c "$(curl -L <https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh>)"
```

> **Reference**: [OCI CLI GitHub Repository](https://github.com/oracle/oci-cli)

---

## OCI CLI Configuration

### Initialize Configuration

Run the interactive configuration setup:

```bash
oci setup config
```

### Configuration Walkthrough

Follow the prompts as shown below:

```text
Enter a location for your config [/home/acarranz/.oci/config]:
Config file: /home/acarranz/.oci/config already exists. Do you want add a profile here? (If no, you will be prompted to overwrite the file) [Y/n]: n
File: /home/acarranz/.oci/config already exists. Do you want to overwrite (Removes existing profiles!!!)? [y/N]: y
Enter a user OCID: ocid1.user.oc1..aaaaaaaawk4rub6owraxupd4fuhxgxbkjxzq6jgved3znahq2j3ipskpsuuq
Enter a tenancy OCID: ocid1.tenancy.oc1..aaaaaaaaeefzcmykyr4je53uozry5tuhac74ubwan5ykxnd4vkx4lgfkyq4q
Enter a region by index or name(e.g.
1: af-johannesburg-1, 2: ap-batam-1, 3: ap-chiyoda-1, 4: ap-chuncheon-1, 5: ap-chuncheon-2,
6: ap-dcc-canberra-1, 7: ap-dcc-gazipur-1, 8: ap-delhi-1, 9: ap-hyderabad-1, 10: ap-ibaraki-1,
11: ap-kulai-2, 12: ap-melbourne-1, 13: ap-mumbai-1, 14: ap-osaka-1, 15: ap-seoul-1,
16: ap-seoul-2, 17: ap-singapore-1, 18: ap-singapore-2, 19: ap-suwon-1, 20: ap-sydney-1,
21: ap-tokyo-1, 22: ca-montreal-1, 23: ca-toronto-1, 24: eu-amsterdam-1, 25: eu-budapest-1,
26: eu-crissier-1, 27: eu-dcc-dublin-1, 28: eu-dcc-dublin-2, 29: eu-dcc-milan-1, 30: eu-dcc-milan-2,
31: eu-dcc-rating-1, 32: eu-dcc-rating-2, 33: eu-dcc-zurich-1, 34: eu-frankfurt-1, 35: eu-frankfurt-2,
36: eu-jovanovac-1, 37: eu-madrid-1, 38: eu-madrid-2, 39: eu-madrid-3, 40: eu-marseille-1,
41: eu-milan-1, 42: eu-paris-1, 43: eu-stockholm-1, 44: eu-turin-1, 45: eu-zurich-1,
46: il-jerusalem-1, 47: me-abudhabi-1, 48: me-abudhabi-2, 49: me-abudhabi-3, 50: me-abudhabi-4,
51: me-alain-1, 52: me-dcc-doha-1, 53: me-dcc-muscat-1, 54: me-dubai-1, 55: me-ibri-1,
56: me-jeddah-1, 57: me-riyadh-1, 58: mx-monterrey-1, 59: mx-queretaro-1, 60: sa-bogota-1,
61: sa-riodejaneiro-1, 62: sa-santiago-1, 63: sa-saopaulo-1, 64: sa-valparaiso-1, 65: sa-vinhedo-1,
66: uk-cardiff-1, 67: uk-gov-cardiff-1, 68: uk-gov-london-1, 69: uk-london-1, 70: us-ashburn-1,
71: us-ashburn-2, 72: us-chicago-1, 73: us-gov-ashburn-1, 74: us-gov-chicago-1, 75: us-gov-phoenix-1,
76: us-langley-1, 77: us-luke-1, 78: us-newark-1, 79: us-phoenix-1, 80: us-saltlake-2,
81: us-sanjose-1, 82: us-somerset-1, 83: us-thames-1): 70
Do you want to generate a new API Signing RSA key pair? (If you decline you will be asked to supply the path to an existing key.) [Y/n]: y
Enter a directory for your keys to be created [/home/acarranz/.oci]:
Enter a name for your key [oci_api_key]:
Public key written to: /home/acarranz/.oci/oci_api_key_public.pem
Enter a passphrase for your private key ("N/A" for no passphrase):
Repeat for confirmation:
Error: The two entered values do not match.
Enter a passphrase for your private key ("N/A" for no passphrase):
Repeat for confirmation:
Private key written to: /home/acarranz/.oci/oci_api_key.pem
Fingerprint: c3:72:15:e2:33:4a:39:df:92:d1:6d:15:7e:33:c9:a0
Config written to /home/acarranz/.oci/config


    If you haven't already uploaded your API Signing public key through the
    console, follow the instructions on the page linked below in the section
    'How to upload the public key':

        https://docs.cloud.oracle.com/Content/API/Concepts/apisigningkey.htm#How2


```

## Finding Your OCIDs

You'll need to retrieve your User OCID and Tenancy OCID from the Oracle Cloud web console.

### Steps to Find OCIDs

1. **Access Oracle Cloud Console**: <https://cloud.oracle.com/>

2. **User OCID**:
   - Click on your **Profile** (top right)
   - Select **User Settings**
   - Click **Copy OCID**

3. **Tenancy OCID**:
   - Navigate to **Tenancy**
   - Go to **Tenancy Details**
   - Click **Copy OCID**

---

## Upload Public Key to Oracle Cloud

After generating your API signing key pair, you must upload the public key to Oracle Cloud.

> [!IMPORTANT]
> The configuration file includes basic authentication information for the SDK, CLI, and other OCI developer tools. You must upload the public key through the web console to complete the setup.

**Reference**: [How to Upload the Public Key](https://docs.cloud.oracle.com/Content/API/Concepts/apisigningkey.htm#How2)

---

## Configuration File Reference

Your generated configuration should look similar to this:

```text
[DEFAULT]
user=ocid1.user.oc1..aaaaaaaawk4rub6owraxupd4fuhxgxbkjxzq6jgved3znahq2j3ipskpsuuq
fingerprint=c3:72:15:e2:33:4a:39:df:92:d1:6d:15:7e:33:c9:a0
key_file=/home/acarranz/.oci/oci_api_key.pem
tenancy=ocid1.tenancy.oc1..aaaaaaaaeefzcmykyr4je53uozry5tuhac74ubwan5ykxnd4vkx4lgfkyq4q
region=us-ashburn-1
```

**View your configuration:**

```bash
cat ~/.oci/config
```

> [!NOTE]
> Make sure to update the `key_file` parameter with the actual path to your private key (typically `~/.oci/oci_api_key.pem`).

---

## Verification

### Test OCI CLI

Verify that the OCI CLI is properly configured by listing available regions:

```bash
oci iam region list
```

If the command returns a list of regions, your OCI CLI is successfully configured! 🚀
