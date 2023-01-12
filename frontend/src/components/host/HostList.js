import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table, Stack, Badge } from 'react-bootstrap';
import AppNavbar from './../AppNavbar';
import { Link } from 'react-router-dom';
import { RiRefreshLine } from 'react-icons/ri';

class HostList extends Component {
    constructor(props) {
            super(props);
            this.state = {hosts: [],};
            this.remove = this.remove.bind(this);
    }
    componentDidMount() {
        this.getHosts()
    }

    async getHosts() {
        fetch('/hosts')
            .then(response => response.json())
            .then(data => this.setState({hosts: data}));
    }

    async remove(id) {
        await fetch(`/host/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(() => {
            let updatedHosts = [...this.state.hosts].filter(i => i.id !== id);
            this.setState({hosts: updatedHosts});
        });
    }

    async connect(id) {
        const dbDeviceList = await fetch('/devices?hostId=' + id + '&isSaved=true', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        const currentDeviceList = await fetch('/devices?hostId=' + id + '&isSaved=false', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
        dbDeviceList.filter(
            dbDevice => !currentDeviceList.includes(dbDevice)
        ).forEach(
            (dbDevice) => {
                fetch(`/device/` + dbDevice.id, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                })
            }
        )
        await fetch('/devices', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                currentDeviceList.filter(
                    currentDevice => !dbDeviceList.some((dbDevice) => dbDevice.serial === currentDevice.serial)
                )
            )
        })
    }

    async updateState(id) {
        await fetch(`/host/${id}/updateState?deleteDevices=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        this.getHosts()
    }

    render() {
        const {hosts} = this.state;

        const hostList = hosts.map(host => {
            return <tr key={host.id}>
                <td style={{whiteSpace: 'nowrap'}}>{host.name}</td>
                <td>{host.address}</td>
                <td>{host.port}</td>
                <td>{String(host.isActive)}</td>
                <td>
                    <ButtonGroup>
                        <Button size="sm" variant="outline-dark" as={Link} to={"/hosts/" + host.id}>Edit</Button>
                        <Button size="sm" variant="outline-danger" onClick={() => this.remove(host.id)}>Delete</Button>
                        <Button size="sm" variant="outline-success" onClick={() => this.connect(host.id)}>Connect</Button>
                        <Button size="sm" variant="outline-info" onClick={() => this.updateState(host.id)}><RiRefreshLine /></Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        return (
            <div>
                <AppNavbar/>
                <Container fluid>
                    <Stack direction="horizontal" gap={2}>
                      <h2>Hosts <Badge bg="dark">{hosts.length}</Badge></h2>
                      <div className="float-right ms-auto">
                          <Button variant="dark" as={Link} to="/hosts/new">Add host</Button>
                      </div>
                    </Stack>
                    <Table className="mt-4">
                        <thead>
                        <tr>
                            <th width="20%">Name</th>
                            <th width="20%">Address</th>
                            <th width="20%">Port</th>
                            <th width="20%">Active</th>
                            <th width="20%">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {hostList}
                        </tbody>
                    </Table>
                </Container>
            </div>
        );
    }
}
export default HostList;