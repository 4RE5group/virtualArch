#ifndef VIRTUALARCH_H
#define VIRTUALARCH_H

#include "stdio.h"
#include "unistd.h"
#include "stdlib.h"
#include "string.h"
#include <stdint.h>

#define err(X)		{fprintf(stderr, "\033[31mERROR\033[0m: %s\n", X); exit(1);}

int		compile(char *file_content, size_t file_size);
int		assemble(char *file_content, size_t file_size, uint16_t **opcodes,
			size_t *opcode_count);
int		emulate(const uint16_t *opcodes, size_t opcode_count);

#endif
