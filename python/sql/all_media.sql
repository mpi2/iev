SELECT cid, lid, gid, sid, pid, qid, genotype.genotype, gene_symbol, measurement_id, value, checksum, extension, metadataGroup

FROM phenodcc_media.media_file, phenodcc_media.file_extension, phenodcc_overviews.measurements_performed, phenodcc_overviews.genotype

WHERE mid = measurements_performed.measurement_id

AND genotype.genotype_id = gid

AND extension_id = file_extension.id

limit 10

