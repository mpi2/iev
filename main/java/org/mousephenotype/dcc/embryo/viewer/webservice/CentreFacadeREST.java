/*
 * Copyright 2015 Medical Research Council Harwell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.mousephenotype.dcc.embryo.viewer.webservice;

import javax.ejb.Stateless;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.mousephenotype.dcc.embryo.viewer.entities.ACentre;
import org.mousephenotype.dcc.embryo.viewer.webservice.AbstractFacade;
import javax.ws.rs.QueryParam;

@Stateless
@Path("centres")
public class CentreFacadeREST extends AbstractFacade<ACentre> {

    public CentreFacadeREST() {
        super(ACentre.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public CentrePack all(
            @QueryParam("colonyId") String colonyId
    ) {
        CentrePack p = new CentrePack();
        System.out.println("colony id: " + colonyId);
        p.setDataSet(super.findAll());
        return p;
    }
}
