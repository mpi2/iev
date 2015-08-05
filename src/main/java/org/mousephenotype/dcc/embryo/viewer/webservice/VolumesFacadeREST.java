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

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private String firstSearch;
    private String secondSearch;
    private String searchType;
    private String searchTerm;
    
    

    public VolumesFacadeREST() {
        super(Preprocessed.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String all(
            @QueryParam("colony_id") String colonyId, 
            @QueryParam("gene_symbol") String geneSymbol,
            @QueryParam("mgi") String mgi){
        
        
        if (colonyId == null && geneSymbol == null && mgi == null){
            return "Failed";
        }
        
 
            if (geneSymbol != null){
                firstSearch = "Preprocessed.findByGeneSymbol";
                secondSearch = "Preprocessed.findByGeneSymbolAndWt";
                searchType = "geneSymbol";
                searchTerm = geneSymbol;
            }
            else if (colonyId != null){
                firstSearch = "Preprocessed.findByColonyId";
                secondSearch = "Preprocessed.findByColonyIdAndWt";
                searchType = "colonyId";
                searchTerm = colonyId;
            }
            else if (mgi != null){
                firstSearch = "Preprocessed.findByMgi";
                secondSearch = "Preprocessed.findByMgiAndWt";
                searchType = "mgi";
                searchTerm = mgi;
            }
            
            
            EntityManager emcid = getEntityManager();
            TypedQuery<Preprocessed> qcid = emcid.createNamedQuery(firstSearch, Preprocessed.class);
            qcid.setParameter(searchType, searchTerm);
            List<Preprocessed> p = qcid.getResultList();
            if (p.size() < 1){
                return "failed";
            }
           
            //Get a set of unique centre IDs
            Set<Integer> set = new HashSet<>();
            for (Preprocessed p1 : p) {
                set.add(p1.getCid());
            }
            
            EntityManager em = getEntityManager();
            HashMap<Integer, List<Preprocessed>> centreResults = new HashMap<>();
            for (Integer cid : set){
                
                TypedQuery<Preprocessed> q = em.createNamedQuery(secondSearch, Preprocessed.class);
                q.setParameter(searchType, searchTerm);
                q.setParameter("centreId", cid);
                List<Preprocessed> v = q.getResultList();
                centreResults.put(cid, v);
            }
       
            HashMap<String, Object> allResults = new HashMap<>();
            allResults.put("success", true);
            allResults.put("num_centres", set.size());
            allResults.put("centre_data", centreResults);
            em.close();
            System.out.println("all");
            System.out.println(allResults);

        Gson gson = new GsonBuilder()
                .disableHtmlEscaping()
                .setPrettyPrinting()
                .create();
          
        String json = gson.toJson(allResults);
        return json;
    }
}
