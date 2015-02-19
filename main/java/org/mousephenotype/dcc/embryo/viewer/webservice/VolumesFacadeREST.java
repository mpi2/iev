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

import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed;

@Stateless
@Path("volumes")
public class VolumesFacadeREST extends AbstractFacade<Preprocessed> {

    public VolumesFacadeREST() {
        super(Preprocessed.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public VolumesPack all(
            @QueryParam("colony_id") String colonyId
            
            //@QueryParam("cid") Integer centreId
    ) {
        VolumesPack p = new VolumesPack();
        EntityManager em = getEntityManager();
        TypedQuery<Preprocessed> q = em.createNamedQuery("Preprocessed.findByColonyIdAndWt", Preprocessed.class);
        q.setParameter("colonyId", colonyId);
        //q.setParameter("cid", centreId);
        List<Preprocessed> v = q.getResultList();
        em.close();
        p.setDataSet(v);
        return p;
    }
}
