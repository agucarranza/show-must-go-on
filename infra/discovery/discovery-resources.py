import oci
from os import getenv

# Configuración de la autenticación

# get from env
oci_config_path = getenv("OCI_CONFIG_PATH", "${HOME}/.oci/config")
oci_profile = getenv("OCI_PROFILE", "DEFAULT")

config = oci.config.from_file(oci_config_path, oci_profile)

# list of compartments
compartment_client = oci.identity.IdentityClient(config)
compartments = compartment_client.list_compartments(config["tenancy"]).data
#include the root compartment
root_compartment = compartment_client.get_compartment(config["tenancy"]).data
compartments.append(root_compartment)

# Inicialización del cliente de Compute
compute_client = oci.core.ComputeClient(config)

for compartment in compartments:
    print("Compartment")
    print(f"Nombre: {compartment.name}")
    print(f"ID: {compartment.id}")
    print(f"Estado: {compartment.lifecycle_state}")
    print("---")

# list of instances for all compartments
# get all the metadata needed to recreate the instance with terraform
for compartment in compartments:
    instances = compute_client.list_instances(compartment_id=compartment.id).data
    for instance in instances:
        print("Instance")
        print(f"Nombre: {instance.display_name}")
        print(f"ID: {instance.id}")
        print(f"Estado: {instance.lifecycle_state}")
        print("---")