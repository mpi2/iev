/*
 * Copyright 2016 Medical Research Council Harwell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Neil Horner <n.horner@har.mrc.ac.uk>
 * @author James Brown <james.brown@har.mrc.ac.uk>
 */

package org.mousephenotype.dcc.embryo.viewer.webservice;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.codehaus.jettison.json.JSONException;
import org.mousephenotype.dcc.embryo.viewer.entities.Centre;
import org.mousephenotype.dcc.embryo.viewer.entities.Preprocessed;


/**
 *
 * @author neil
 */
@Stateless
@Path("ready")
public class DataReadyFacadeREST extends AbstractFacade<Preprocessed> {
    
    
    private final String IEVURL = "https://dev.mousephenotype.org/embryoviewer?mgi=";
    private HashMap<Integer, String> centreMapping;

    public DataReadyFacadeREST() {
        super(Preprocessed.class);
        
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public String all() throws JSONException{
        
        getCentreIdMapping();
    
        //VolumesPack vp = new VolumesPack();
        EntityManager em = getEntityManager();
        TypedQuery<Preprocessed> q = em.createNamedQuery("Preprocessed.findByStatusReady", Preprocessed.class);
       
        List<Preprocessed> results = q.getResultList();

        em.close();
       
      
        HashMap<String, ReadyRestMaker> resultHash = new HashMap<>();
        HashMap<String, ArrayList<HashMap<String, Object>>> out = new HashMap<>();
        
        for (Preprocessed p: results){
            if (!resultHash.containsKey(p.getMgi())){
                ReadyRestMaker m = new ReadyRestMaker();
                
                m.setColonyId(p.getColonyId());
                String cenName = centreMapping.get(p.getCid());
                m.setCentreId(cenName);
                m.setMgi(p.getMgi());
                m.addModality(String.valueOf(p.getPid()),
                        String.valueOf(p.getQid()));
                resultHash.put(p.getMgi(), m);
            // ?
            }else{
               ReadyRestMaker maker = resultHash.get(p.getMgi());
               maker.addModality(String.valueOf(p.getPid()),
                        String.valueOf(p.getQid()));
            }
           
        //Build list to output
        ArrayList<HashMap<String, Object>>  resultList = new ArrayList<>();
        for (ReadyRestMaker r : resultHash.values()){
            resultList.add(r.getResults());
        }
        
        out.put("colonies", resultList );
            
        }
        //JSONObject jo = new JSONObject();
        Gson gson = new GsonBuilder()
                .disableHtmlEscaping()
                .setPrettyPrinting()
                .create();
          
        String json = gson.toJson(out);
        return json;
    }
   
    
    private void getCentreIdMapping(){
        EntityManager em = getEntityManager();
        TypedQuery<Centre> q = em.createNamedQuery("Centre.getNames", Centre.class);
        List<Centre> results = q.getResultList();
        centreMapping = new HashMap<>();
        for (Centre c: results){
            centreMapping.put(c.getCentreId(), c.getShortName());
        }
        em.close();
        
    }
}
