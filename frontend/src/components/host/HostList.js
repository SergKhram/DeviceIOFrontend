import React, { Component } from 'react';
import { Button, ButtonGroup, Container, Table } from 'react-bootstrap';
import AppNavbar from './../AppNavbar';
import { Link } from 'react-router-dom';
import Stack from 'react-bootstrap/Stack';

class HostList extends Component {
    constructor(props) {
            super(props);
            this.state = {hosts: []};
            this.remove = this.remove.bind(this);
    }
    componentDidMount() {
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
//        console.log("DELETING IS STARTED")
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
//        console.log("DELETING IS FINISHED")
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
                        <Button size="sm" variant="primary" as={Link} to={"/hosts/" + host.id}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => this.remove(host.id)}>Delete</Button>
                        <Button size="sm" variant="success" onClick={() => this.connect(host.id)}>Connect</Button>
                    </ButtonGroup>
                </td>
            </tr>
        });

        return (
            <div>
                <AppNavbar/>
                <Container fluid>
                    <Stack direction="horizontal" gap={2}>
                      <h2>Hosts</h2>
                      <div className="float-right ms-auto">
                          <Button color="success" as={Link} to="/hosts/new">Add host</Button>
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