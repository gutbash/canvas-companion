/*Unsuccessful Implementation of Auth0*/

import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import JSONPretty from 'react-json-pretty';

const profile = () => {
    const { user } = useAuth0();

    return (
        <div>
            <JSONPretty data={user} />
             {J /*SON.stringify(user, null, 2) */}
        </div>
    )
}

export default profile