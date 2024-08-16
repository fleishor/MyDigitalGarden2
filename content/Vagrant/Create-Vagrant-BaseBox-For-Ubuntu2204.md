---
title: Create a Vagrant base box for Ubuntu 22.04
date: 2023-12-15
tags:
  - Vagrant
---

## Quellen

- [Github](https://github.com/fleishor/VagrantKubernetesCluster/tree/master/BaseBoxes)

## Vagrantfile

<!-- https://raw.githubusercontent.com/fleishor/VagrantKubernetesCluster/master/Vagrantfile -->
~~~ruby
# Set IP Adresses of Master and Worker nodes
DESKTOP_IP      = "192.168.56.1"
UBUNTU_IP      = "192.168.56.8"

Vagrant.configure("2") do |config|
  config.vm.box = "generic/ubuntu2204"
  config.vm.box_check_update = false
  config.vm.synced_folder ".", "/vagrant"
  config.ssh.insert_key=true

  # disable vbguest additions
  if Vagrant.has_plugin?("vagrant-vbguest")
    config.vbguest.auto_update = true
  end

  # use proxy at host machine
  if Vagrant.has_plugin?("vagrant-proxyconf")
    config.apt_proxy.http = "http://192.168.178.44:3142"
    config.apt_proxy.https = "http://192.168.178.44:3142"
  end

  # define cpu/memory of nodes
  nodes = [
    { :name => "ubuntu2204"  , :ip => UBUNTU_IP,   :cpus => 2, :memory => 4096, :disksize => "32GB" },
  ]

  # create virtual machine
  nodes.each do |opts|
    config.vm.define opts[:name] do |node|
      node.vm.hostname = opts[:name]
#      node.vm.network "private_network", ip: opts[:ip]

      node.vm.provider "virtualbox" do |vb|
        vb.name = opts[:name]
        vb.cpus = opts[:cpus]
        vb.memory = opts[:memory]
      end
      
       # special provision for ubuntu
      if node.vm.hostname == "ubuntu2204" then
        node.vm.provision "shell", path:"./provision_ubuntu.sh"
      end
    end
  end
end
~~~

## provision_ubuntu.sh

<!-- https://raw.githubusercontent.com/fleishor/VagrantKubernetesCluster/master/BaseBoxes/provision_ubuntu.sh -->
~~~bash
#!/bin/bash -e

echo "--------------------------------------------------------------------------------"
echo "Disable IPv6"
echo "--------------------------------------------------------------------------------"
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
cat <<EOF | sudo tee -a /etc/default/grub
GRUB_CMDLINE_LINUX="ipv6.disable=1"
EOF
sudo update-grub

echo "--------------------------------------------------------------------------------"
echo "Prepare /etc/hosts"
echo "--------------------------------------------------------------------------------"
sudo tee /etc/hosts<<EOF
192.168.56.1    desktop.fritz.box    desktop
192.168.56.8    admin.vboxnet0       admin
192.168.56.9    nfsserver.vboxnet0   nfsserver
192.168.56.10   master.vboxnet0      master
192.168.56.11   node-01.vboxnet0     node-01
192.168.56.12   node-02.vboxnet0     node-02
192.168.56.13   node-03.vboxnet0     node-03
EOF

echo "--------------------------------------------------------------------------------"
echo "Disable SWAP"
echo "--------------------------------------------------------------------------------"
sudo sed -i '/\sswap\s/ s/^\(.*\)$/#\1/g' /etc/fstab
sudo swapoff -a
sudo rm /swap.img || true

echo "--------------------------------------------------------------------------------"
echo "Load Kernel modules"
echo "--------------------------------------------------------------------------------"
sudo modprobe overlay
sudo modprobe br_netfilter
sudo cat <<EOF | sudo tee /etc/modules-load.d/kubernetes.conf
overlay
br_netfilter
EOF

echo "--------------------------------------------------------------------------------"
echo "Kernel settings"
echo "--------------------------------------------------------------------------------"
sudo tee /etc/sysctl.d/kubernetes.conf<<EOF
net.bridge.bridge-nf-call-ip6tables = 0
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sudo sysctl --system

echo "--------------------------------------------------------------------------------"
echo "Switch apt from https to http in order to squid-deb"
echo "--------------------------------------------------------------------------------"
sudo cp /etc/apt/sources.list /etc/apt/sources.list.backup
sudo sed -i 's/https:\/\//http:\/\//g' /etc/apt/sources.list

echo "--------------------------------------------------------------------------------"
echo "Update Ubuntu (1. Round)"
echo "--------------------------------------------------------------------------------"
sudo apt-get -y update
sudo apt-get -y upgrade

echo "--------------------------------------------------------------------------------"
echo "Update SSH login"
echo "--------------------------------------------------------------------------------"
wget -O /home/vagrant/.ssh/authorized_keys https://raw.githubusercontent.com/hashicorp/vagrant/master/keys/vagrant.pub

~~~

## Vagrant commands

### Package base box

~~~
vagrant package --base ubuntu2204 --output ubuntu2204.box
~~~

### Add base box to repository

~~~
vagrant box list
vagrant box remove fleishor/ubuntu2204
vagrant box add ubuntu2204.box --name fleishor/ubuntu2204
~~~
