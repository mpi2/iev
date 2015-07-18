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
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQueries;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import javax.xml.bind.annotation.XmlRootElement;

/**
 *
 * @author james
 */
@Entity
@Table(name = "analysis", catalog = "phenodcc_embryo", schema = "")
@XmlRootElement
@NamedQueries({
    @NamedQuery(name = "Analysis.findAll", query = "SELECT a FROM Analysis a"),
    @NamedQuery(name = "Analysis.findById", query = "SELECT a FROM Analysis a WHERE a.id = :id"),
    @NamedQuery(name = "Analysis.findByCid", query = "SELECT a FROM Analysis a WHERE a.cid = :cid"),
    @NamedQuery(name = "Analysis.findByLid", query = "SELECT a FROM Analysis a WHERE a.lid = :lid"),
    @NamedQuery(name = "Analysis.findByGid", query = "SELECT a FROM Analysis a WHERE a.gid = :gid"),
    @NamedQuery(name = "Analysis.findBySid", query = "SELECT a FROM Analysis a WHERE a.sid = :sid"),
    @NamedQuery(name = "Analysis.findByPid", query = "SELECT a FROM Analysis a WHERE a.pid = :pid"),
    @NamedQuery(name = "Analysis.findByQid", query = "SELECT a FROM Analysis a WHERE a.qid = :qid"),
    @NamedQuery(name = "Analysis.findByNoBaselines", query = "SELECT a FROM Analysis a WHERE a.noBaselines = :noBaselines"),
    @NamedQuery(name = "Analysis.findByNoMutants", query = "SELECT a FROM Analysis a WHERE a.noMutants = :noMutants"),
    @NamedQuery(name = "Analysis.findByStatusId", query = "SELECT a FROM Analysis a WHERE a.statusId = :statusId"),
    @NamedQuery(name = "Analysis.findByActive", query = "SELECT a FROM Analysis a WHERE a.active = :active"),
    @NamedQuery(name = "Analysis.findByDateStarted", query = "SELECT a FROM Analysis a WHERE a.dateStarted = :dateStarted"),
    @NamedQuery(name = "Analysis.findByDateCompleted", query = "SELECT a FROM Analysis a WHERE a.dateCompleted = :dateCompleted")})
public class Analysis implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Basic(optional = false)
    @Column(name = "id")
    private Integer id;
    @Basic(optional = false)
    @NotNull
    @Column(name = "cid")
    private int cid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "lid")
    private int lid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "gid")
    private int gid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "sid")
    private int sid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "pid")
    private int pid;
    @Basic(optional = false)
    @NotNull
    @Column(name = "qid")
    private int qid;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(name = "no_baselines")
    private String noBaselines;
    @Basic(optional = false)
    @NotNull
    @Size(min = 1, max = 45)
    @Column(name = "no_mutants")
    private String noMutants;
    @Basic(optional = false)
    @NotNull
    @Column(name = "status_id")
    private int statusId;
    @Column(name = "active")
    private Integer active;
    @Size(max = 45)
    @Column(name = "date_started")
    private String dateStarted;
    @Size(max = 45)
    @Column(name = "date_completed")
    private String dateCompleted;

    public Analysis() {
    }

    public Analysis(Integer id) {
        this.id = id;
    }

    public Analysis(Integer id, int cid, int lid, int gid, int sid, int pid, int qid, String noBaselines, String noMutants, int statusId) {
        this.id = id;
        this.cid = cid;
        this.lid = lid;
        this.gid = gid;
        this.sid = sid;
        this.pid = pid;
        this.qid = qid;
        this.noBaselines = noBaselines;
        this.noMutants = noMutants;
        this.statusId = statusId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public int getCid() {
        return cid;
    }

    public void setCid(int cid) {
        this.cid = cid;
    }

    public int getLid() {
        return lid;
    }

    public void setLid(int lid) {
        this.lid = lid;
    }

    public int getGid() {
        return gid;
    }

    public void setGid(int gid) {
        this.gid = gid;
    }

    public int getSid() {
        return sid;
    }

    public void setSid(int sid) {
        this.sid = sid;
    }

    public int getPid() {
        return pid;
    }

    public void setPid(int pid) {
        this.pid = pid;
    }

    public int getQid() {
        return qid;
    }

    public void setQid(int qid) {
        this.qid = qid;
    }

    public String getNoBaselines() {
        return noBaselines;
    }

    public void setNoBaselines(String noBaselines) {
        this.noBaselines = noBaselines;
    }

    public String getNoMutants() {
        return noMutants;
    }

    public void setNoMutants(String noMutants) {
        this.noMutants = noMutants;
    }

    public int getStatusId() {
        return statusId;
    }

    public void setStatusId(int statusId) {
        this.statusId = statusId;
    }

    public Integer getActive() {
        return active;
    }

    public void setActive(Integer active) {
        this.active = active;
    }

    public String getDateStarted() {
        return dateStarted;
    }

    public void setDateStarted(String dateStarted) {
        this.dateStarted = dateStarted;
    }

    public String getDateCompleted() {
        return dateCompleted;
    }

    public void setDateCompleted(String dateCompleted) {
        this.dateCompleted = dateCompleted;
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
        if (!(object instanceof Analysis)) {
            return false;
        }
        Analysis other = (Analysis) object;
        if ((this.id == null && other.id != null) || (this.id != null && !this.id.equals(other.id))) {
            return false;
        }
        return true;
    }

    @Override
    public String toString() {
        return "org.mousephenotype.dcc.embryo.viewer.entities.Analysis[ id=" + id + " ]";
    }
    
}
