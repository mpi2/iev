/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.mousephenotype.dcc.embryo.viewer.entities;

import java.io.Serializable;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author james
 */
@Entity
@Table(name = "intensity_analysis")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "IntensityAnalysis.findAll", query = "SELECT i FROM IntensityAnalysis i"),
    @NamedQuery(name = "IntensityAnalysis.findById", query = "SELECT i FROM IntensityAnalysis i WHERE i.id = :id"),
    @NamedQuery(name = "IntensityAnalysis.findByAnalysisId", query = "SELECT i FROM IntensityAnalysis i WHERE i.analysisId = :analysisId"),
    @NamedQuery(name = "IntensityAnalysis.findByFdr1", query = "SELECT i FROM IntensityAnalysis i WHERE i.fdr1 = :fdr1"),
    @NamedQuery(name = "IntensityAnalysis.findByFdr5", query = "SELECT i FROM IntensityAnalysis i WHERE i.fdr5 = :fdr5"),
    @NamedQuery(name = "IntensityAnalysis.findByFdr10", query = "SELECT i FROM IntensityAnalysis i WHERE i.fdr10 = :fdr10")})
public class IntensityAnalysis implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @Basic(optional = false)
    @NotNull
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "analysis_id")
    private int analysisId;
    @Column(name = "fdr_1")
    private Long fdr1;
    @Column(name = "fdr_5")
    private Long fdr5;
    @Column(name = "fdr_10")
    private Long fdr10;

    public IntensityAnalysis() {
    }

    public IntensityAnalysis(Integer id) {
        this.id = id;
    }

    public IntensityAnalysis(Integer id, int analysisId) {
        this.id = id;
        this.analysisId = analysisId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getAnalysisId() {
        return analysisId;
    }

    public void setAnalysisId(int analysisId) {
        this.analysisId = analysisId;
    }

    public Long getFdr1() {
        return fdr1;
    }

    public void setFdr1(Long fdr1) {
        this.fdr1 = fdr1;
    }

    public Long getFdr5() {
        return fdr5;
    }

    public void setFdr5(Long fdr5) {
        this.fdr5 = fdr5;
    }

    public Long getFdr10() {
        return fdr10;
    }

    public void setFdr10(Long fdr10) {
        this.fdr10 = fdr10;
    }

    @Override
    public int hashCode() {
        int hash = 0;
        hash += (id != null ? id.hashCode() : 0);
        return hash;
    }

    @Override
    public boolean equals(Object object) {
        // TODO: Warning - this method won't work in the case the id fields are not set
        if (!(object instanceof IntensityAnalysis)) {
            return false;
        }
        IntensityAnalysis other = (IntensityAnalysis) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.mousephenotype.dcc.embryo.viewer.entities.IntensityAnalysis[ id=" + id + " ]";
    }
    
}
