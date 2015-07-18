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

import java.util.ArrayList;
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
import org.mousephenotype.dcc.embryo.viewer.entities.Analysis;


@Stateless
@Path("volumes")
public class VolumesFacadeREST extends AbstractFacade<Preprocessed> {

    public VolumesFacadeREST() {
        super(Preprocessed.class);
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public VolumesPack all(
            @QueryParam("colony_id") String colonyId, 
            @QueryParam("gene_symbol") String geneSymbol) {
        
        VolumesPack vp = new VolumesPack();
        
        if (colonyId == null && geneSymbol == null){
            return vp;
        }
  
        EntityManager emcid = getEntityManager();
        EntityManager em = getEntityManager();
        TypedQuery<Preprocessed> qcid;
        List<Preprocessed> p; // = new ArrayList<Preprocessed>();
     
        if (colonyId != null){
            
            qcid = emcid.createNamedQuery("Preprocessed.findByColonyId", Preprocessed.class);
            qcid.setParameter("colonyId", colonyId);
            p = qcid.getResultList();
            if (p.size() < 1) return vp;
          
            int centreId = p.get(0).getCid();
           
            TypedQuery<Preprocessed> q = em.createNamedQuery("Preprocessed.findByColonyIdAndWt", Preprocessed.class);
            q.setParameter("colonyId", colonyId);
            q.setParameter("centreId", centreId);
            List<Preprocessed> v = q.getResultList();
           
            em.close();
            vp.setDataSet(v);
        }
        
        else if (geneSymbol != null){
           
            qcid = emcid.createNamedQuery("Preprocessed.findByGeneSymbol", Preprocessed.class);
            qcid.setParameter("geneSymbol", geneSymbol);
            p = qcid.getResultList();
            if (p.size() < 1) return vp;
            
            int centreId = p.get(0).getCid();
            System.out.println("centre id " + centreId);
            TypedQuery<Preprocessed> q = em.createNamedQuery("Preprocessed.findByGeneSymbolAndWt", Preprocessed.class);
            q.setParameter("geneSymbol", geneSymbol);
            q.setParameter("centreId", centreId);
            List<Preprocessed> v = q.getResultList();
            em.close();
            vp.setDataSet(v);
            
            // Get analysis data if it exists (by gid for now)
            int genotypeId = p.get(0).getGid();
            System.out.println("genotype id " + genotypeId);
            EntityManager emAna = getEntityManager();
            TypedQuery<Analysis> qAna = emAna.createNamedQuery("Analysis.findByGid", Analysis.class);
            qAna.setParameter("gid", genotypeId);
            List<Analysis> ana = qAna.getResultList();
            emAna.close();
           
            if (ana.isEmpty() == false) {
                vp.setAnalysisData(ana.get(0));
            }
                        
        }
 
        return vp;
    }
}
